import Concat from 'concat-with-sourcemaps';
import iconv from 'iconv-lite';
import fs from 'fs';
import path from 'path';
import adjustSourceMap from '../utils/adjust-sourcemap';
import {getEncoding} from './build/adjust-encoding';

const separator = '\n\n';
const generateSourceMap = true;
const encoding = 'utf-8';

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
					const mapContent = JSON.parse(fs.readFileSync(sourceMapPath, encoding));

					mapContent.sources = mapContent.sources.map(sourcePath => (
						path.resolve(path.dirname(sourceMapPath), sourcePath)
					));

					sourceMapContent = JSON.stringify(mapContent);
				}

				concatenator.add(filePath, fileContent, sourceMapContent);
			});

		const {content, sourceMap} = concatenator;
		const contentEncoding = getEncoding(content);
		const decodedContent = iconv.decode(content, contentEncoding).toString();

		const decodedContentString = (
			// eslint-disable-next-line
			decodedContent.toString(contentEncoding)
			// eslint-disable-next-line
			.replace(/\/\/# sourceMappingURL=(.*)\.map/g, '') +
			`\n//# sourceMappingURL=${path.basename(output)}.map`
		);

		const resultFileContent = (() => {
			const cleanContent = decodedContentString.replace(/\/\*(\s+)?eslint-disable(\s+)?\*\/\n/g, '');
			return `/* eslint-disable */\n${cleanContent}`;
		})();

		const outputFile = fs.existsSync(output) ? fs.readFileSync(output) : null;
		const outputEncoding = outputFile ? getEncoding(outputFile) : contentEncoding;
		const encodedContent = iconv.encode(resultFileContent, outputEncoding);

		fs.writeFileSync(output, encodedContent);
		fs.writeFileSync(`${output}.map`, sourceMap);
		adjustSourceMap(`${output}.map`);
	}
}