import assert from 'assert';
import buildModulePath from '../../../src/utils/build-module-path';

describe('utils/build-module-path', () => {
	it('Should be exported as function', () => {
		assert(typeof buildModulePath === 'function');
	});

	it('Should return module path from extension path', () => {
		const samples = [
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/js/main/loader/loader.js',
				result: '/bitrix/js/main/loader/loader.js'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/js/other-dir/loader/loader.js',
				result: '/bitrix/js/other-dir/loader/loader.js'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/js/other_dir/loader/loader.js',
				result: '/bitrix/js/other_dir/loader/loader.js'
			},
			{
				source: '/modules/main/install/js/main/loader/loader.js',
				result: '/bitrix/js/main/loader/loader.js'
			}
		];

		samples.forEach(entry => {
			assert(buildModulePath(entry.source) === entry.result);
		});
	});

	it('Should return module path from Windows like extension path', () => {
		const samples = [
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\js\\main\\loader\\loader.js',
				result: '/bitrix/js/main/loader/loader.js'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\js\\other-dir\\loader\\loader.js',
				result: '/bitrix/js/other-dir/loader/loader.js'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\js\\other_dir\\loader\\loader.js',
				result: '/bitrix/js/other_dir/loader/loader.js'
			},
			{
				source: '\\modules\\main\\install\\js\\main\\loader\\loader.js',
				result: '/bitrix/js/main/loader/loader.js'
			}
		];

		samples.forEach(entry => {
			assert(buildModulePath(entry.source) === entry.result);
		});
	});

	it('Should return local extension path', () => {
		const sourcePath = '/Users/vladimirbelov/Documents/www/bitrix24/local/js/main/loader/src/loader.js';
		const resultPath = '/local/js/main/loader/src/loader.js';

		assert.strictEqual(buildModulePath(sourcePath), resultPath);
	});

	it('Should return local extension path (Windows)', () => {
		const sourcePath = '\\Users\\vladimirbelov\\Documents\\www\\bitrix24\\local\\js\\main\\loader\\src\\loader.js';
		const resultPath = '/local/js/main/loader/src/loader.js';

		assert.strictEqual(buildModulePath(sourcePath), resultPath);
	});
});