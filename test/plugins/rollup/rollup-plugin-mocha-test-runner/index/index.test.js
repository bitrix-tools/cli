import assert from 'assert';
import plugin from '../../../../../src/plugins/rollup/rollup-plugin-mocha-test-runner';

describe('plugins/rollup/rollup-plugin-mocha-test-runner', () => {
	it('Should be exported as function', () => {
		assert(typeof plugin === 'function');
	});

	it('Should be return object implemented rollup plugin interface', () => {
		const result = plugin();

		assert(typeof result === 'object');
		assert(result.name === 'test');
		assert(typeof result.onwrite === 'function');
	});
});