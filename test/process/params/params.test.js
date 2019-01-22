import assert from 'assert';
import * as path from 'path';
import params from '../../../src/process/params';

describe('process/params', () => {
	it('Should be exported as object', () => {
		assert(typeof params === 'object');
	});

	it('Should includes static property "path"', () => {
		assert(typeof params.path === 'string');
	});

	it('Should includes static property "modules"', () => {
		assert(Array.isArray(params.modules));
	});

	describe('path', () => {
		it('Should return path from argv.path', () => {
			const dataPath = path.resolve(__dirname, 'data');

			params.__Rewire__('argv', {
				path: dataPath
			});

			assert(params.path === dataPath);
		});

		it('Should return path from argv.path', () => {
			const dataPath = path.resolve(__dirname, 'data');

			params.__Rewire__('argv', {
				path: dataPath
			});

			assert(params.path === dataPath);
		});

		it('Should return path from process.cwd()', () => {
			params.__Rewire__('argv', {});

			assert(params.path === process.cwd());
		});
	});

	describe('modules', () => {
		it('Should return modules paths from argv.modules', () => {
			const modules = 'main,ui';
			const result = modules
				.split(',')
				.map(module => path.resolve(module));

			params.__Rewire__('argv', {
				modules: modules
			});

			assert.deepStrictEqual(params.modules, result);
		});

		it('Should return empty array if modules not passed', () => {
			params.__Rewire__('argv', {});

			assert.deepStrictEqual(params.modules, []);
		});

		it('Should return all modules from repository root ' +
			'if modules not passed and cwd is modules repository', () => {
			const modules = ['module1', 'module2'];

			params.__Rewire__('isRepositoryRoot', () => true);
			params.__Rewire__('getDirectories', () => modules);

			assert.deepStrictEqual(params.modules, modules);
		});
	});
});