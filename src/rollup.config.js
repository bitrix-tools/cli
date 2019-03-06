import postcss from 'rollup-plugin-postcss-independed';
import autoprefixer from 'autoprefixer';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-simple-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import resolvePackageModule from './utils/resolve-package-module';

export default function rollupConfig({input, output, plugins = {}}) {
	const enabledPlugins = [];

	if (plugins.resolve)
	{
		enabledPlugins.push(resolve());
	}

	enabledPlugins.push(json());
	enabledPlugins.push(postcss({
		extract: true,
		sourceMap: false,
		plugins: [
			autoprefixer({
				browsers: [
					'ie >= 11',
					'last 4 version',
				],
			}),
		],
	}));

	if (plugins.babel !== false)
	{
		enabledPlugins.push(babel(plugins.babel || {
			sourceMaps: true,
			presets: [
				resolvePackageModule('@babel/preset-env'),
			],
			plugins: [
				resolvePackageModule('@babel/plugin-external-helpers'),
				resolvePackageModule('@babel/plugin-transform-flow-strip-types'),
				resolvePackageModule('@babel/plugin-proposal-class-properties'),
				resolvePackageModule('@babel/plugin-proposal-private-methods'),
			],
		}));
	}

	if (plugins.resolve)
	{
		enabledPlugins.push(commonjs({
			sourceMap: false,
		}));
	}

	return {
		input: {
			input: input.input,
			external: [
				'BX',
			],
			treeshake: input.treeshake !== false,
			plugins: enabledPlugins,
			onwarn: () => {},
		},
		output: {
			file: output.file,
			name: output.name || 'window',
			format: 'iife',
			sourcemap: true,
			extend: true,
			exports: 'named',
			globals: {
				BX: 'BX',
				window: 'window',
				...output.globals,
			},
		},
	};
}