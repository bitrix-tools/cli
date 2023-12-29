import Concat from 'concat-with-sourcemaps';
import fs from 'fs';
import path from 'path';
import adjustSourceMap from '../utils/adjust-sourcemap';

const separator = '\n\n';
const generateSourceMap = true;

export default function concat(input: string[] = [], output: string) {
	if (Array.isArray(input) && input.length) {
		const concatenator = new Concat(generateSourceMap, output, separator);

		input
			.filter(fs.existsSync)
			.forEach((filePath) => {
				const fileContent = fs.readFileSync(filePath);
				const sourceMapPath = `${filePath}.map`;
				let sourceMapContent;

				if (fs.existsSync(sourceMapPath)) {
					const mapContent = fs.readFileSync(sourceMapPath, 'utf-8');
					const mapJSON = JSON.parse(mapContent);

					mapJSON.sources = mapJSON.sources.map(sourcePath => (
						path.resolve(path.dirname(sourceMapPath), sourcePath)
					));

					sourceMapContent = JSON.stringify(mapJSON);
				}

				concatenator.add(filePath, fileContent, sourceMapContent);
			});

		const {content, sourceMap} = concatenator;

		const resultFileContent = (() => {
			const cleanContent = content
				.toString()
				.replace(/\/\*(\s+)?eslint-disable(\s+)?\*\/\n/g, '')
				.replace(
					/\/\/# sourceMappingURL=(.*)\.map/g,
					'',
				)
				+ `\n//# sourceMappingURL=${path.basename(output)}.map`;

			return `/* eslint-disable */\n${cleanContent}`;
		})();

		fs.writeFileSync(output, resultFileContent);
		fs.writeFileSync(`${output}.map`, sourceMap);
		adjustSourceMap(`${output}.map`);
	}
}
