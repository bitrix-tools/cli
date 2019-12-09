import assert from 'assert';
import buildComponentPath from '../../../src/utils/build-component-path';

describe('utils/build-component-path', () => {
	it('Should be exported as function', () => {
		assert(typeof buildComponentPath === 'function');
	});

	it('Should return component path relative of product from component path relative of repository', () => {
		const samples = [
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/components/bitrix/' +
					'main.ui.filter/templates/.default/script.js',
				result: '/bitrix/components/bitrix/' +
					'main.ui.filter/templates/.default/script.js'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/components/test-vendor/' +
					'main.ui.filter/templates/.default/script.js',
				result: '/bitrix/components/test-vendor/' +
					'main.ui.filter/templates/.default/script.js'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/components/test_vendor/' +
					'main.ui.filter/templates/.default/script.js',
				result: '/bitrix/components/test_vendor/' +
					'main.ui.filter/templates/.default/script.js'
			}
		];

		samples.forEach(entry => {
			assert(buildComponentPath(entry.source) === entry.result);
		});
	});

	it('Should return correct component path from Windows like path', () => {
		const samples = [
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\components\\bitrix\\' +
					'main.ui.filter\\templates\\.default\\script.js',
				result: '/bitrix/components/bitrix/' +
					'main.ui.filter/templates/.default/script.js'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\components\\test-vendor\\' +
					'main.ui.filter\\templates\\.default\\script.js',
				result: '/bitrix/components/test-vendor/' +
					'main.ui.filter/templates/.default/script.js'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\components\\test_vendor\\' +
					'main.ui.filter\\templates\\.default\\script.js',
				result: '/bitrix/components/test_vendor/' +
					'main.ui.filter/templates/.default/script.js'
			}
		];

		samples.forEach(entry => {
			assert(buildComponentPath(entry.source) === entry.result);
		});
	});

	it('Should return correct path for local component', () => {
		const sourcePath = '/Users/vladimirbelov/Documents/www/bitrix24/local/components/mynamespace/mycomponent/templates/.default/script.js';
		const resultPath = '/local/components/mynamespace/mycomponent/templates/.default/script.js';

		assert.strictEqual(buildComponentPath(sourcePath), resultPath);
	});

	it('Should return correct path for local component (Windows)', () => {
		const sourcePath = '\\Users\\vladimirbelov\\Documents\\www\\bitrix24\\local\\components\\mynamespace\\mycomponent\\templates\\.default\\script.js';
		const resultPath = '/local/components/mynamespace/mycomponent/templates/.default/script.js';

		assert.strictEqual(buildComponentPath(sourcePath), resultPath);
	});
});