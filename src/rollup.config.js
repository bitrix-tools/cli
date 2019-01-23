import postcss from 'rollup-plugin-postcss-independed';
import autoprefixer from 'autoprefixer';
import json from 'rollup-plugin-json';
import reporter from 'rollup-plugin-reporter';
import babel from 'rollup-plugin-simple-babel';
import bitrixReporter from './reporters/bitrix.reporter';
import argv from './process/argv';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import namespaceTransformer from './plugins/rollup/rollup-plugin-namespace-transformer/index';
import mochaTestRunner from './plugins/rollup/rollup-plugin-mocha-test-runner/index';
import resolvePackageModule from './utils/resolve-package-module';

export default function rollupConfig({ input, output }) {
	return {
		input: {
			input: input.input,
			external: [
				'BX',
				'react',
				'react-dom'
			],
			treeshake: input.treeshake !== false,
			plugins: [
				resolve(),
				json(),
				postcss({
					extract: true,
					sourceMap: false,
					plugins: [
						autoprefixer({
							browsers: [
								'ie >= 11',
								'last 4 version'
							]
						})
					]
				}),
				babel({
					sourceMaps: true,
					presets: [
						resolvePackageModule('@babel/preset-env'),
						resolvePackageModule('@babel/preset-react')
					],
					plugins: [
						resolvePackageModule('@babel/plugin-external-helpers'),
						resolvePackageModule('@babel/plugin-transform-flow-strip-types'),
						resolvePackageModule('@babel/plugin-proposal-class-properties'),
						resolvePackageModule('@babel/plugin-proposal-private-methods')
					]
				}),
				commonjs({
					sourceMap: false,
				}),
				mochaTestRunner(),
				namespaceTransformer({
					namespaceFunction: (function() {
						if (output.namespaceFunction === null) {
							return output.namespaceFunction;
						}

						if (typeof output.namespaceFunction === 'string') {
							return output.namespaceFunction;
						}

						return 'BX.namespace';
					})()
				}),
				reporter({
					exclude: ['style.js'],
					report: (bundle) => {
						if (argv.report !== false) {
							bitrixReporter(bundle, argv);
						}
					}
				})
			],
			onwarn: () => {}
		},
		output: {
			file: output.file,
			name: output.name || 'window',
			format: 'iife',
			sourcemap: true,
			extend: true,
			exports: 'named',
			globals: {
				'BX': 'BX',
				'react': 'React',
				'react-dom': 'ReactDOM',
				'window': 'window',
				...output.globals
			}
		}
	};
}