import json from 'rollup-plugin-json';
import commonJs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-simple-babel';
import pkg from './package.json';

export default [
	{
		input: './src/cli/bitrix.build.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.build.js'
		},
	},
	{
		input: './src/cli/bitrix.test.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.test.js'
		}
	},
	{
		input: './src/cli/bitrix.flow.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.flow.js'
		}
	},
	{
		input: './src/cli/bitrix.unhandled.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.unhandled.js'
		},
	},
	{
		input: './src/cli/bitrix.adjust.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.adjust.js'
		}
	},
	{
		input: './src/cli/bitrix.create.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.create.js'
		}
	},
	{
		input: './src/cli/bitrix.settings.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.settings.js'
		}
	},
	{
		input: './src/cli/bitrix.info.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.info.js'
		}
	},
	{
		input: './src/test.bootstrap.js',
		output: {
			format: 'cjs',
			file: './dist/test.bootstrap.js'
		}
	},
	{
		input: './src/rollup.config.js',
		output: {
			format: 'cjs',
			file: './dist/rollup.config.js'
		}
	},
	{
		input: './src/process/params.js',
		output: {
			format: 'cjs',
			file: './dist/process/params.js'
		}
	},
	{
		input: './src/process/command.js',
		output: {
			format: 'cjs',
			file: './dist/process/command.js'
		}
	},
	{
		input: './src/process/argv.js',
		output: {
			format: 'cjs',
			file: './dist/process/argv.js'
		}
	}
].map(entry => {
	return Object.assign({}, entry, {
		plugins: [
			json(),
			babel({
				plugins: [
					"@babel/plugin-transform-flow-strip-types"
				]
			}),
			commonJs(),
		],
		external: Object.keys(pkg.dependencies).concat([], [
			'os',
			'path',
			'fs',
			'events',
			'util'
		])
	});
});