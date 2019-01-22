import glob from 'fast-glob';
import * as path from 'path';
import slash from 'slash';
import isEs6File from './is-es6-file';

const options = {
	dot: true,
	cache: true,
	unique: false
};

function getConfigs(directory) {
	directory = slash(directory);

	const pattern = [
		path.resolve(directory, '**/bundle.config.js'),
		path.resolve(directory, '**/script.es6.js')
	];

	return glob
		.sync(pattern, options)
		.reduce((acc, file) => {
			let context = path.dirname(file);
			let config = getConfigByFile(file);
			let configs = makeIterable(config);

			configs.forEach(currentConfig => {
				acc.push({
					input: path.resolve(context, currentConfig.input),
					output: path.resolve(context, currentConfig.output),
					name: currentConfig.namespace || '',
					treeshake: currentConfig.treeshake !== false,
					adjustConfigPhp: currentConfig.adjustConfigPhp !== false,
					namespaceFunction: currentConfig.namespaceFunction,
					rel: makeIterable(currentConfig.rel),
					context: path.resolve(context),
					concat:  prepareConcat(currentConfig.concat, path.resolve(context))
				});
			});

			return acc;
		}, []);
}

function prepareConcat(files, context) {
	if (typeof files !== 'object') {
		return {};
	}

	files = {...files};

	Object.keys(files).forEach(key => {
		if (Array.isArray(files[key])) {
			files[key] = files[key].map(filePath => {
				return path.resolve(context, filePath);
			});
		}
	});

	return files;
}

function getConfigByFile(configPath) {
	if (isEs6File(configPath)) {
		const context = configPath.replace('script.es6.js', '');

		return {
			input: path.resolve(context, 'script.es6.js'),
			output: path.resolve(context, 'script.js')
		};
	}

	return require(configPath);
}

function makeIterable(value) {
	if (Array.isArray(value)) {
		return value;
	}

	if (typeof value !== 'undefined' && value !== null) {
		return [value];
	}

	return [];
}

export default getConfigs;