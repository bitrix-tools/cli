import assert from 'assert';
import argv from '../../../src/process/argv';

describe('process/argv', () => {
	it('Should be exported as object', () => {
		assert(!!argv && typeof argv === 'object');
	});

	it('Should contains "_" property as array', () => {
		assert(Array.isArray(argv._) === true);
	});
});