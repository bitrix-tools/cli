import assert from 'assert';
import path from 'path';
import buildRollupConfig from '../../../src/utils/build-rollup-config';

describe('utils/build-rollup-config', () => {
	it('Should be exported as function', () => {
		assert(typeof buildRollupConfig === 'function');
	});

	it('Should return correct config if passed passed correct base config', () => {
		let baseConfig = {
			input: './app.js',
			output: {
				js: './app.bundle.js',
				css: './app.bundle.css',
			},
			context: '/test/context',
			targets: [
				'IE 11',
				'last 4 version',
			]
		};

		let result = buildRollupConfig(baseConfig);

		assert(result.input.input === path.resolve(baseConfig.context, baseConfig.input));
		assert(result.output.file === path.resolve(baseConfig.context, baseConfig.output.js));
		assert(result.output.name === 'window');

		baseConfig.name = 'BX.Test';

		result = buildRollupConfig(baseConfig);

		assert(result.output.name === 'BX.Test');
	});
});