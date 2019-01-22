import assert from 'assert';
import directory from '../../../src/process/directory';
import Directory from '../../../src/entities/directory';

describe('process/directory', () => {
	it('Should be exported as instance of entities/directory (Directory)', () => {
		assert(!!directory && directory instanceof Directory);
	});
});