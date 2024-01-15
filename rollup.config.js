const json = require('rollup-plugin-json');
const commonJs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-simple-babel');
const pkg = require('./package.json');

module.exports = [
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
		input: './src/cli/bitrix.update-internals.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.update-internals.js'
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
		input: './src/cli/bitrix.run.js',
		output: {
			format: 'cjs',
			file: './dist/bitrix.run.js'
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
					'@babel/plugin-transform-flow-strip-types',
					'@babel/plugin-proposal-optional-chaining',
					'@babel/plugin-proposal-nullish-coalescing-operator',
				],
			}),
			commonJs(),
		],
		external: Object.keys(pkg.dependencies).concat([], [
			'os',
			'path',
			'fs',
			'events',
			'util',
			'postcss-url/src/lib/decl-processor',
			'iconv-lite',
			'v8',
			'vm',
			'colors/safe',
			'url',
		])
	});
});
