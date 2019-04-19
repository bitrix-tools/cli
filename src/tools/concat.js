import Concat from 'concat-with-sourcemaps';
import * as iconv from 'iconv-lite';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {resolve, dirname, basename} from 'path';
import adjustSourceMap from '../utils/adjust-sourcemap';
import {getEncoding} from './build/adjust-encoding';

const separator = '\n\n';
const generateSourceMap = true;
const encoding = 'utf-8';

export default function concat(input: string[] = [], output: string) {
	if (Array.isArray(input) && input.length) {
		const concatenator = new Concat(generateSourceMap, output, separator);

		input
			.filter(existsSync)
			.forEach((filePath) => {
				const fileContent = readFileSync(filePath);
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
		const contentEncoding = getEncoding(content);
		const decodedContent = iconv.decode(content, contentEncoding).toString();

		const decodedContentString = (
			// eslint-disable-next-line
			decodedContent.toString(contentEncoding)
			// eslint-disable-next-line
			.replace(/\/\/# sourceMappingURL=(.*)\.map/g, '') +
			`\n//# sourceMappingURL=${basename(output)}.map`
		);

		const outputFile = existsSync(output) ? readFileSync(output) : null;
		const outputEncoding = outputFile ? getEncoding(outputFile) : contentEncoding;
		const encodedContent = iconv.encode(decodedContentString, outputEncoding);


		writeFileSync(output, encodedContent);
		writeFileSync(`${output}.map`, sourceMap);
		adjustSourceMap(`${output}.map`);
	}
}