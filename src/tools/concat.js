import Concat from 'concat-with-sourcemaps';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import adjustSourceMap from '../utils/adjust-sourcemap';

const separator = '\n\n';
const generateSourceMap = true;
const encoding = 'utf-8';

export default function concat(input: string[] = [], output: string) {
	if (Array.isArray(input) && input.length) {
		const concatenator = new Concat(generateSourceMap, output, separator);

		input
			.filter(existsSync)
			.forEach(filePath => {
				let fileContent = readFileSync(filePath, encoding);
				let sourceMapContent = undefined;
				let sourceMapPath = `${filePath}.map`;

				if (existsSync(sourceMapPath)) {
					let mapContent = JSON.parse(readFileSync(sourceMapPath, encoding));

					mapContent.sources = mapContent.sources.map(sourcePath => {
						return resolve(dirname(sourceMapPath), sourcePath);
					});

					sourceMapContent = JSON.stringify(mapContent);
				}

				concatenator.add(filePath, fileContent, sourceMapContent);
			});

		let { content, sourceMap } = concatenator;

		writeFileSync(output, content);
		writeFileSync(`${output}.map`, sourceMap);
		adjustSourceMap(`${output}.map`);
	}
}