import assert from 'assert';
import buildComponentName from '../../../src/utils/build-component-name';

describe('utils/build-component-name', () => {
	it('Should be exported as function', () => {
		assert(typeof buildComponentName === 'function');
	});

	it('Should return correct component name', () => {
		const samples = [
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/components/bitrix/main.ui.filter/templates/.default/script.js',
				result: 'bitrix:main.ui.filter'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/components/test/main.ui.filter/templates/.default/script.js',
				result: 'test:main.ui.filter'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/components/test/main.ui.filter/templates/.default/script.js',
				result: 'test:main.ui.filter'
			}
		];

		samples.forEach(entry => {
			assert(buildComponentName(entry.source) === entry.result);
		});
	});

	it('Should return correct component name from Windows like path', () => {
		const samples = [
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\components\\bitrix\\main.ui.filter\\templates\\.default\\script.js',
				result: 'bitrix:main.ui.filter'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\components\\test\\main.ui.filter\\templates\\.default\\script.js',
				result: 'test:main.ui.filter'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'test\\install\\components\\test\\main.ui.filter\\templates\\.default\\script.js',
				result: 'test:main.ui.filter'
			}
		];

		samples.forEach(entry => {
			assert(buildComponentName(entry.source) === entry.result);
		});
	});

	it('Should return component name for local component', () => {
		const sourcePath = '/Users/vladimirbelov/Documents/www/bitrix24/local/components/mynamespace/mycomponent/templates/.default/script.js';
		const resultName = 'mynamespace:mycomponent';

		assert.strictEqual(buildComponentName(sourcePath), resultName);
	});

	it('Should return component name for local component (Windows)', () => {
		const sourcePath = '\\Users\\vladimirbelov\\Documents\\www\\bitrix24\\local\\components\\mynamespace\\mycomponent\\templates\\.default\\script.js';
		const resultName = 'mynamespace:mycomponent';

		assert.strictEqual(buildComponentName(sourcePath), resultName);
	});
});