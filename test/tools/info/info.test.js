import assert from 'assert';
import info from '../../../src/tools/info';

describe('tools/info', () => {
	it('Should be exported as function', () => {
		assert(typeof info === 'function');
	});

	it('Should return object', () => {
		const result = info();

		assert(
			!!result
			&& typeof result === 'object'
			&& Object.keys(result).length > 0
		);
	});
});