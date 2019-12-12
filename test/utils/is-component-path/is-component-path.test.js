import isComponentPath from '../../../src/utils/is-component-path';
import assert from 'assert';

describe('utils/is-component-path', () => {
	it('Should be exported as function', () => {
		assert(typeof isComponentPath === 'function');
	});

	it('Should return true for components paths', () => {
		const validPaths = [
			'/repo/modules/main/install/components/bitrix/main.ui.filter/templates/.default/script.js',
			'/repo/modules/main/install/components/bitrix/main.ui.grid/templates/.default/script.js',
			'/repo/modules/main/install/components/partner/main.ui.grid/templates/.default/script.js',

			'/repo/modules/main/install/templates/test/components/partner/main.ui.grid/templates/.default/script.js',
			'/repo/modules/main/install/templates/.default/components/partner/main.ui.grid/templates/.default/script.js',

			'/www/bitrix/modules/main/install/components/partner/main.ui.grid/templates/.default/script.js',
			'/www/local/modules/main/install/components/partner/main.ui.grid/templates/.default/script.js',

			'/www/bitrix/templates/test/components/bitrix/main.ui.grid/templates/.default/script.js',
			'/www/local/templates/test/components/partner/main.ui.grid/templates/.default/script.js',

			'/www/bitrix/components/partner/main.ui.grid/templates/.default/script.js',
			'/www/local/components/partner/main.ui.grid/templates/.default/script.js',
		];

		validPaths.forEach(path => {
			assert(isComponentPath(path) === true);
		});
	});

	it('Should return false for not components path', () => {
		const invalidPaths = [
			'/main/installation/components/bitrix/main.ui.filter/templates/.default/script.js',
			'/main/install/components-and-more/bitrix/main.ui.grid/templates/.default/script.js'
		];

		invalidPaths.forEach(path => {
			assert(isComponentPath(path) === false);
		});
	});
});