import Concat from 'concat-with-sourcemaps';
import path from 'path';
import { readFileSync } from 'fs';

const separator = '\n\n';
const generateSourceMap = true;

export default function concatPlugin(options: { jsFiles?: Array<string>; cssFiles?: Array<string> } = {}) {
	const {
		jsFiles = [],
		cssFiles = [],
	} = options;

	return {
		name: 'concat',

		generateBundle(outputOptions, bundle) {
			const determineOutputName = (outputOpt, defaultBaseName, extension) => {
				if (outputOpt && typeof outputOpt === 'string') {
					return path.basename(outputOpt, path.extname(outputOpt)) + extension;
				}
				return defaultBaseName;
			};

			const allJsFilesFromBundle = Object.entries(bundle)
				.filter(([fileName, fileInfo]) => {
					return (
						(fileInfo?.type === 'chunk' && fileName.endsWith('.js')) ||
						(fileInfo?.type === 'asset' && fileName.endsWith('.js'))
					);
				})
				.map(([fileName, fileInfo]) => fileName);

			const allCssFilesFromBundle = Object.entries(bundle)
				.filter(([fileName, fileInfo]) => {
					return (
						fileInfo.type === 'asset' &&
						/\.(css|scss|sass|less)$/i.test(fileName)
					);
				})
				.map(([fileName, fileInfo]) => fileName);

			if ((allJsFilesFromBundle.length > 0 || jsFiles.length > 0)) {
				const outputJsFileName = determineOutputName(outputOptions.file, 'concatenated.js', '.js');
				const outputJsSourceMapName = determineOutputName(outputOptions.file, 'concatenated.js', '.js.map');

				const concatenator = new Concat(generateSourceMap, outputJsFileName, separator);

				allJsFilesFromBundle.forEach(fileName => {
					const fileInfo = bundle[fileName];

					let content = '';
					let sourceMapContent = null;

					if (fileInfo.type === 'chunk') {
						content = fileInfo.code;
						if (fileInfo.map) {
							sourceMapContent = JSON.stringify(fileInfo.map);
						}
					} else if (fileInfo.type === 'asset') {
						content = fileInfo.source;
					}

					content = content
						.replace(/\/\*(\s+)?eslint-disable(\s+)?\*\/\n/g, '')
						.replace(/\/\/# sourceMappingURL=(.*)\.map/g, '');

					concatenator.add(fileName, content, sourceMapContent);
				});

				jsFiles.forEach(filePath => {
					try {
						let fileContent = readFileSync(filePath, 'utf8');
						let sourceMapContent = null;
						const mapPath = `${filePath}.map`;
						try {
							const mapRaw = readFileSync(mapPath, 'utf8');
							const mapObj = JSON.parse(mapRaw);
							mapObj.sources = mapObj.sources.map(src => path.resolve(path.dirname(mapPath), src));
							sourceMapContent = JSON.stringify(mapObj);
						} catch (e) {
						}

						fileContent = fileContent
							.replace(/\/\*(\s+)?eslint-disable(\s+)?\*\/\n/g, '')
							.replace(/\/\/# sourceMappingURL=(.*)\.map/g, '');

						concatenator.add(filePath, fileContent, sourceMapContent);
					} catch (error) {
						this.warn(`Could not read static JS file '${filePath}': ${error.message}`);
					}
				});

				if (concatenator.content) {
					let resultFileContent = concatenator.content
							.toString()
							.replace(/\/\/# sourceMappingURL=(.*)\.map/g, '')
						+ `\n//# sourceMappingURL=${path.basename(outputJsSourceMapName)}`;

					resultFileContent = `/* eslint-disable */\n${resultFileContent}`;

					bundle[outputJsFileName] = {
						fileName: outputJsFileName,
						type: 'asset',
						source: resultFileContent,
					};

					if (concatenator.sourceMap) {
						bundle[outputJsSourceMapName] = {
							fileName: outputJsSourceMapName,
							type: 'asset',
							source: concatenator.sourceMap,
						};
					}
				}
			}

			if ((allCssFilesFromBundle.length > 0 || cssFiles.length > 0)) {
				const outputCssFileName = determineOutputName(outputOptions.file, 'concatenated.css', '.css');

				let concatenatedCss = '';

				allCssFilesFromBundle.forEach(fileName => {
					const fileInfo = bundle[fileName];
					concatenatedCss += fileInfo.source + '\n';
				});

				cssFiles.forEach(filePath => {
					try {
						const fileContent = readFileSync(filePath, 'utf8');
						concatenatedCss += fileContent + '\n';
					} catch (error) {
						this.warn(`Could not read static CSS file '${filePath}': ${error.message}`);
					}
				});

				if (concatenatedCss) {
					bundle[outputCssFileName] = {
						fileName: outputCssFileName,
						type: 'asset',
						source: concatenatedCss.trimEnd(),
					};
				}
			}
		}
	};
}
