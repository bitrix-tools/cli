import assert from 'assert';
import help from '../../../src/help';

describe('help', () => {
	it('Should be exported as function', () => {
		assert(typeof help === 'function');
	});

	it('Should does not throws', () => {
		assert.doesNotThrow(() => {
			help();
		});
	});
});