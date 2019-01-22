import assert from 'assert';
import buildTemplatePath from '../../../src/utils/build-template-path';

describe('utils/build-template-path', () => {
	it('Should be exported as function', () => {
		assert(typeof buildTemplatePath === 'function');
	});

	it('Should return template path relative product from template path relative repository', () => {
		const samples = [
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/templates/.default/script.js',
				result: '/bitrix/templates/.default/script.js'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/templates/test-template/script.js',
				result: '/bitrix/templates/test-template/script.js'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix' +
					'/modules/main/install/templates/test_template/script.js',
				result: '/bitrix/templates/test_template/script.js'
			}
		];

		samples.forEach(entry => {
			assert(buildTemplatePath(entry.source) === entry.result);
		});
	});

	it('Should return template path from Windows like path', () => {
		const samples = [
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\templates\\.default\\script.js',
				result: '/bitrix/templates/.default/script.js'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\templates\\test-template\\script.js',
				result: '/bitrix/templates/test-template/script.js'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix' +
					'\\modules\\main\\install\\templates\\test_template\\script.js',
				result: '/bitrix/templates/test_template/script.js'
			}
		];

		samples.forEach(entry => {
			assert(buildTemplatePath(entry.source) === entry.result);
		});
	});
});