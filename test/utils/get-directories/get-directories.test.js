import getDirectories from '../../../src/utils/get-directories';
import assert from 'assert';
import path from 'path';

describe('utils/get-directories', () => {
	it('Should be exported as function', () => {
		assert(typeof getDirectories === 'function');
	});

	it('Should return all closest child', () => {
		const result = getDirectories(path.resolve(__dirname, 'data'));

		assert(Array.isArray(result) === true);
		assert(result.length === 3);
		assert(result.includes('dir1') === true);
		assert(result.includes('dir2') === true);
		assert(result.includes('dir3') === true);
		assert(result.includes('child-dir') === false);
	});
});