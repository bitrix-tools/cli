import isModulePath from '../../../src/utils/is-module-path';
import assert from 'assert';

describe('utils/is-module-path', () => {
	it('Should be exported as function', () => {
		assert(typeof isModulePath === 'function');
	});

	it('Should return true for modules paths', () => {
		const validPaths = [
			'/main/install/js/main/myext/app.js',
			'/ui/install/js/ui/myext/app.js',
			'/module/install/js/custom-dir/myext/app.js'
		];

		validPaths.forEach(path => {
			assert(isModulePath(path) === true);
		});
	});

	it('Should return false for not modules path', () => {
		const invalidPaths = [
			'/install/js/main/myext/app.js',
			'/ui/installation/js/ui/myext/app.js'
		];

		invalidPaths.forEach(path => {
			assert(isModulePath(path) === false);
		});
	});
});