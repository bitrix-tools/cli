import postcss from 'rollup-plugin-postcss-independed';
import autoprefixer from 'autoprefixer';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-simple-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcssSvgo from 'postcss-svgo';
import { terser } from 'rollup-plugin-terser';
import resolvePackageModule from './utils/resolve-package-module';
import postcssBackgroundUrl from './plugins/postcss/postcss-backbround-url';
import rollupFiles from './plugins/rollup/rollup-plugin-files';
import path from 'path';
import { statSync } from 'fs';

export default function rollupConfig({
	input,
	output,
	context,
	plugins = {},
	cssImages = {},
	resolveFilesImport = {},
	targets,
	transformClasses,
	minification,
	sourceMaps,
}) {
	const enabledPlugins = [];
	const isLoaded = (id) => !!enabledPlugins.find((item) => {
		return item.name === id;
	});

	const compatMode = targets.some((rule) => {
		const parsed = String(rule).toLowerCase().split(' ');
		return (
			!parsed.includes('not')
			&& (
				parsed.includes('ie')
				|| parsed.includes('ie_mob')
			)
		);
	});

	if (Array.isArray(plugins.custom))
	{
		plugins.custom.forEach((item) => {
			enabledPlugins.push(item);
		});
	}

	if (plugins.resolve && !isLoaded('node-resolve'))
	{
		enabledPlugins.push(resolve({
			browser: true,
		}));
	}

	if (!isLoaded('json'))
	{
		enabledPlugins.push(json());
	}

	if (!isLoaded('postcss'))
	{
		enabledPlugins.push(postcss({
			extract: output.css || true,
			sourceMap: false,
			plugins: [
				postcssBackgroundUrl(
					cssImages,
					output.css,
					context,
				),
				(() => {
					if (cssImages.svgo !== false)
					{
						return postcssSvgo({
							encode: true,
						});
					}

					return undefined;
				})(),
				autoprefixer({
					overrideBrowserslist: targets,
				}),
			],
		}));
	}

	if (plugins.babel !== false)
	{
		enabledPlugins.push(babel(plugins.babel || {
			sourceMaps,
			presets: [
				[
					resolvePackageModule('@babel/preset-env'),
					{
						targets,
						bugfixes: !compatMode,
						loose: !compatMode && !transformClasses,
					},
				],
			],
			plugins: [
				resolvePackageModule('@babel/plugin-external-helpers'),
				resolvePackageModule('@babel/plugin-transform-flow-strip-types'),
				...(() => {
					const babelPlugins = [];

					if (compatMode)
					{
						Object.assign(
							babelPlugins,
							[
								resolvePackageModule('@babel/plugin-proposal-object-rest-spread'),
							],
						);
					}

					if (compatMode || transformClasses)
					{
						Object.assign(
							babelPlugins,
							[
								resolvePackageModule('@babel/plugin-proposal-class-properties'),
								resolvePackageModule('@babel/plugin-proposal-private-methods'),
								resolvePackageModule('@babel/plugin-transform-classes'),
							],
						);
					}

					return babelPlugins;
				})(),
			],
		}));
	}

	if (plugins.resolve && !isLoaded('commonjs'))
	{
		enabledPlugins.push(commonjs({
			sourceMap: false,
		}));
	}

	if (minification)
	{
		const terserPlugin = (() => {
			if (
				typeof minification === 'object'
			)
			{
				return terser(minification);
			}

			return terser();
		})();

		enabledPlugins.push(terserPlugin);
	}

	return {
		input: {
			input: input.input,
			external: [
				'BX',
			],
			treeshake: input.treeshake !== false,
			plugins: [
				{
					name: 'resolve-index',
					resolveId: (importPath, modulePath) => {
						if (!importPath || path.isAbsolute(importPath))
						{
							return null;
						}

						if (!modulePath)
						{
							return null;
						}

						const moduleDir = path.dirname(modulePath);
						const pathsToTry = ['.js', '.css', '.jsx', '.vue'].map((ext) => {
							return path.join(moduleDir, importPath, `index${ext}`);
						});

						const paths = pathsToTry.map((pathToTry) => {
							let stats;
							let result = null;

							try
							{
								stats = statSync(pathToTry);
								if (stats.isFile())
								{
									result = pathToTry;
								}
							}
							catch (err)
							{
								result = null;
							}

							return result;
						});

						const filteredPaths = paths.filter(Boolean);
						if (filteredPaths.length > 1)
						{
							throw new Error(` Found multiple matching paths! \n${filteredPaths.join('\n')}`.red);
						}

						return filteredPaths.at(0);
					}
				},
				(() => {
					if (!isLoaded('url') && resolveFilesImport !== false)
					{
						return rollupFiles({
							resolveFilesImport,
							context,
							input: input.input,
							output: output.js,
						});
					}

					return undefined;
				})(),
				...enabledPlugins,
			],
			onwarn: () => {},
		},
		output: {
			file: output.js,
			name: output.name || 'window',
			format: 'iife',
			sourcemap: sourceMaps,
			extend: true,
			exports: 'named',
			banner: '/* eslint-disable */',
			globals: {
				BX: 'BX',
				window: 'window',
				...output.globals,
			},
		},
	};
}
