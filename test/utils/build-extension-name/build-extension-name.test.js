import assert from 'assert';
import buildExtensionName from '../../../src/utils/build-extension-name';

describe('utils/build-extension-name', () => {
	it('Should be exported as function', () => {
		assert(typeof buildExtensionName === 'function');
	});

	it('Should return correct extension name', () => {
		const samples = [
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/js/main/loader/loader.js',
				context: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/js/main/loader',
				result: 'main.loader'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/js/test/loader/loader.js',
				context: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/js/test/loader',
				result: 'test.loader'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/js/main/loader/loader.js',
				context: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/js/main/loader/',
				result: 'main.loader'
			}
		];

		const winSamples = [
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\js\\main\\loader\\loader.js',
				context: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\js\\main\\loader',
				result: 'main.loader'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\js\\test\\loader\\loader.js',
				context: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\js\\test\\loader',
				result: 'test.loader'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\js\\main\\loader\\loader.js',
				context: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\js\\main\\loader\\',
				result: 'main.loader'
			}
		];

		samples.concat(winSamples).forEach(entry => {
			assert(buildExtensionName(entry.source, entry.context) === entry.result);
		});
	});
});