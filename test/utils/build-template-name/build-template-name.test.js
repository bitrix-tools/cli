import assert from 'assert';
import buildTemplateName from '../../../src/utils/build-template-name';

describe('utils/build-template-name', () => {
	it('Should be exported as function', () => {
		assert(typeof buildTemplateName === 'function');
	});

	it('Should return correct template name', () => {
		const samples = [
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/templates/.default/script.js',
				result: '.default'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/templates/test-template/script.js',
				result: 'test-template'
			},
			{
				source: '/Users/vladimirbelov/Documents/bitrix/modules/' +
					'main/install/templates/test_template/script.js',
				result: 'test_template'
			}
		];

		samples.forEach(entry => {
			assert(buildTemplateName(entry.source) === entry.result);
		});
	});

	it('Should return correct template name from Windows path', () => {
		const samples = [
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\templates\\.default\\script.js',
				result: '.default'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\templates\\test-template\\script.js',
				result: 'test-template'
			},
			{
				source: '\\Users\\vladimirbelov\\Documents\\bitrix\\modules\\' +
					'main\\install\\templates\\test_template\\script.js',
				result: 'test_template'
			}
		];

		samples.forEach(entry => {
			assert(buildTemplateName(entry.source) === entry.result);
		});
	})
});