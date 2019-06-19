import assert from 'assert';
import info from '../../../src/tools/info';

describe('tools/info', () => {
	it('Should be exported as function', () => {
		assert(typeof info === 'function');
	});

	it('Should return object', () => {
		const result = info();

		console.log(!!result);
		console.log(typeof result === 'object');
		console.log(Object.keys(result).length > 0);
		assert(
			!!result
			&& typeof result === 'object'
			&& Object.keys(result).length > 0
		);
	});
});