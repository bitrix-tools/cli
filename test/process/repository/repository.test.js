import assert from 'assert';
import repository from '../../../src/process/repository';
import Repository from '../../../src/entities/repository';

describe('process/repository', () => {
	it('Should be exported as instance of entities/repository (Repository)', () => {
		assert(!!repository && repository instanceof Repository);
	});
});