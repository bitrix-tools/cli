import assert from 'assert';
import path from 'path';
import isRepositoryRoot from '../../../src/utils/is-repository-root';

describe('utils/is-repository-root', () => {
	it('Should be exported as function', () => {
		assert(typeof isRepositoryRoot === 'function');
	});

	it('Should be return true if passed valid repository root', () => {
		const repositoryPath = path.resolve(__dirname, 'data');

		assert(isRepositoryRoot(repositoryPath) === true);
	});

	it('Should be return false if passed invalid repository root', () => {
		const repositoryPath = path.resolve(__dirname, 'test');

		assert(isRepositoryRoot(repositoryPath) === false);
	});
});