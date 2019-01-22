import assert from 'assert';
import path from 'path';
import getCoreJsPath from "../../../src/utils/get-core-js-path";

describe('utils/get-core-js-path', () => {
	it('Should be exported as function', () => {
		assert(typeof getCoreJsPath === 'function');
	});

	it('Should return path to core if passing any path from modules', () => {
		const modules = path.resolve(__dirname, 'data/modules');
		const core = path.resolve(__dirname, 'data/modules/main/install/js/main/core');

		const samples = [
			{
				source: modules,
				result: core
			},
			{
				source: path.resolve(modules, 'main'),
				result: core
			},
			{
				source: path.resolve(modules, 'main/install'),
				result: core
			},
			{
				source: path.resolve(modules, 'main/install/js'),
				result: core
			},
			{
				source: path.resolve(modules, 'main/install/js/main/core'),
				result: core
			}
		];

		samples.forEach(entry => {
			assert(getCoreJsPath(entry.source) === entry.result);
		});
	});

	it('Should return path to core if passing any path from product', () => {
		const root = path.resolve(__dirname, 'data/bitrix/bitrix');
		const core = path.resolve(__dirname, 'data/bitrix/bitrix/js/main/core');

		const samples = [
			{
				source: root,
				result: core
			},
			{
				source: path.resolve(root, 'js'),
				result: core
			},
			{
				source: path.resolve(root, 'js/main'),
				result: core
			},
			{
				source: path.resolve(root, 'js/main/core'),
				result: core
			},
			{
				source: path.resolve(root, 'custom'),
				result: core
			},
			{
				source: '/',
				result: ''
			}
		];

		samples.forEach(entry => {
			assert(getCoreJsPath(entry.source) === entry.result);
		});
	});

	it('Should throws if path doesn\'t string', () => {
		assert.throws(() => {
			getCoreJsPath(null);
		});

		assert.throws(() => {
			getCoreJsPath({});
		});

		assert.throws(() => {
			getCoreJsPath([]);
		});

		assert.throws(() => {
			getCoreJsPath(2);
		});
	});
});