import Concat from 'concat-with-sourcemaps';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {resolve, dirname} from 'path';
import adjustSourceMap from '../utils/adjust-sourcemap';

const separator = '\n\n';
const generateSourceMap = true;
const encoding = 'utf-8';

export default function concat(input: string[] = [], output: string) {
	if (Array.isArray(input) && input.length) {
		const concatenator = new Concat(generateSourceMap, output, separator);

		input
			.filter(existsSync)
			.forEach((filePath) => {
				const fileContent = readFileSync(filePath, encoding);
				const sourceMapPath = `${filePath}.map`;
				let sourceMapContent;

				if (existsSync(sourceMapPath)) {
					const mapContent = JSON.parse(readFileSync(sourceMapPath, encoding));

					mapContent.sources = mapContent.sources.map(sourcePath => (
						resolve(dirname(sourceMapPath), sourcePath)
					));

					sourceMapContent = JSON.stringify(mapContent);
				}

				concatenator.add(filePath, fileContent, sourceMapContent);
			});

		const {content, sourceMap} = concatenator;

		writeFileSync(output, content);
		writeFileSync(`${output}.map`, sourceMap);
		adjustSourceMap(`${output}.map`);
	}
}