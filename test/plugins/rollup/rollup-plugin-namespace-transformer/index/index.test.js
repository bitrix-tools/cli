import assert from 'assert';
import plugin from '../../../../../src/plugins/rollup/rollup-plugin-namespace-transformer';

describe('plugins/rollup/rollup-plugin-namespace-transformer', () => {
	it('Should be exported as function', () => {
		assert(typeof plugin === 'function');
	});

	it('Should be return object implemented rollup plugin interface', () => {
		const result = plugin();

		assert(typeof result === 'object');
		assert(result.name === 'rollup-plugin-namespace-transformer');
		assert(typeof result.renderChunk === 'function');
	});
});