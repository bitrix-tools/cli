import assert from 'assert';
import path from 'path';
import resolvePackageModule from '../../../src/utils/resolve-package-module';

describe('utils/resolve-package-module', () => {
	it('Should be exported as function', () => {
		assert(typeof resolvePackageModule === 'function')
	});

	it('Should resolves path to module', () => {
		const samples = [
			{
				source: 'mocha',
				result: path.resolve(__dirname, '../../../node_modules/mocha')
			},
			{
				source: 'rollup',
				result: path.resolve(__dirname, '../../../node_modules/rollup')
			},
			{
				source: 'babel',
				result: path.resolve(__dirname, '../../../node_modules/babel')
			}
		];

		samples.forEach(entry => {
			assert(resolvePackageModule(entry.source) === entry.result);
		});
	});

	it('Should resolves doesn\'t exists module', () => {
		const samples = [
			{
				source: 'test1',
				result: path.resolve(__dirname, '../../../node_modules/test1')
			},
			{
				source: 'test2',
				result: path.resolve(__dirname, '../../../node_modules/test2')
			},
			{
				source: 'test3',
				result: path.resolve(__dirname, '../../../node_modules/test3')
			}
		];

		samples.forEach(entry => {
			assert(resolvePackageModule(entry.source) === entry.result);
		});
	});

	it('Should throws if module name isn\'t string', () => {
		assert.throws(() => {
			resolvePackageModule();
		});

		assert.throws(() => {
			resolvePackageModule(null);
		});

		assert.throws(() => {
			resolvePackageModule(2);
		});

		assert.throws(() => {
			resolvePackageModule({});
		});

		assert.throws(() => {
			resolvePackageModule([]);
		});
	});
});