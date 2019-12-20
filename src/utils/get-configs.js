import glob from 'fast-glob';
import * as path from 'path';
import slash from 'slash';
import isEs6File from './is-es6-file';

function prepareConcat(files, context) {
	if (typeof files !== 'object') {
		return {};
	}

	const result = {};

	Object.keys(files).forEach((key) => {
		if (Array.isArray(files[key])) {
			result[key] = files[key].map((filePath) => (
				path.resolve(context, filePath)
			));
		}
	});

	return result;
}

function getConfigByFile(configPath) {
	if (isEs6File(configPath)) {
		const context = configPath.replace('script.es6.js', '');

		return {
			input: path.resolve(context, 'script.es6.js'),
			output: {
				js: path.resolve(context, 'script.js'),
				css: path.resolve(context, 'style.css'),
			},
		};
	}

	// eslint-disable-next-line
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

export default function getConfigs(directory) {
	const normalizedDirectory = `${slash(directory)}`;

	const pattern = [
		path.resolve(normalizedDirectory, '**/bundle.config.js'),
		path.resolve(normalizedDirectory, '**/script.es6.js'),
	];

	const options = {
		dot: true,
		cache: true,
		unique: false,
	};

	return glob
		.sync(pattern, options)
		.reduce((acc, file) => {
			const context = path.dirname(file);
			const config = getConfigByFile(file);
			const configs = makeIterable(config);

			configs.forEach((currentConfig) => {
				let {plugins} = currentConfig;

				if (currentConfig.protected && context !== directory)
				{
					return;
				}

				if (typeof plugins !== 'object')
				{
					plugins = {
						resolve: false,
					};
				}

				const output = (() => {
					const changeExt = (filePath, ext) => {
						const pos = filePath.lastIndexOf('.');

						if (pos > 0)
						{
							return `${filePath.substr(0, pos)}.${ext}`;
						}

						return filePath;
					};

					if (typeof currentConfig.output === 'object')
					{
						const {js} = currentConfig.output;
						let {css} = currentConfig.output;

						if (typeof css !== 'string')
						{
							css = changeExt(js, 'css');
						}

						return {
							js: path.resolve(context, js),
							css: path.resolve(context, css),
						};
					}

					return {
						js: path.resolve(context, currentConfig.output),
						css: path.resolve(context, changeExt(currentConfig.output, 'css')),
					};
				})();

				acc.push({
					input: path.resolve(context, currentConfig.input),
					output,
					name: currentConfig.namespace || '',
					treeshake: currentConfig.treeshake !== false,
					adjustConfigPhp: currentConfig.adjustConfigPhp !== false,
					protected: currentConfig.protected === true,
					rel: makeIterable(currentConfig.rel),
					plugins,
					context: path.resolve(context),
					concat: prepareConcat(currentConfig.concat, path.resolve(context)),
					cssImages: currentConfig.cssImages || {},
					resolveFilesImport: currentConfig.resolveFilesImport || {},
				});
			});

			return acc;
		}, []);
}