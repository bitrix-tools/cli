import isTemplatePath from '../../../src/utils/is-template-path';
import assert from 'assert';

describe('utils/is-template-path', () => {
	it('Should be exported as function', () => {
		assert(typeof isTemplatePath === 'function');
	});

	it('Should return true for modules paths', () => {
		const validPaths = [
			'/repos/modules/main/install/templates/.default/script.es6.js',
			'/repos/modules/main/install/templates/my-template/'
		];

		validPaths.forEach(path => {
			assert(isTemplatePath(path) === true);
		});
	});

	it('Should return false for not modules path', () => {
		const invalidPaths = [
			'/main/templates/.default/script.es6.js',
			'/main/install/js/templates/my-template/'
		];

		invalidPaths.forEach(path => {
			assert(isTemplatePath(path) === false);
		});
	});
});