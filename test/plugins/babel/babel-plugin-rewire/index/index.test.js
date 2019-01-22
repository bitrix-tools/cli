import assert from 'assert';
import plugin from '../../../../../src/plugins/babel/babel-plugin-rewire';

describe('plugins/babel/babel-plugin-rewire', () => {
	it('Should be exported as function', () => {
		assert(typeof plugin === 'function');
	});

	it('Should be return object implemented babel plugin interface', () => {
		const result = plugin();

		assert(typeof result === 'object');
		assert(typeof result.visitor === 'object');
		assert(typeof result.visitor.Program === 'object');
		assert(typeof result.visitor.Program.enter === 'function');
	});
});