import assert from 'assert';
import buildNamespaceName from '../../../src/utils/build-namespace-name';

describe('utils/build-extension-name', () => {
	it('Should be exported as function', () => {
		assert(typeof buildNamespaceName === 'function');
	});

	it('Should return namespace with root if passed valid parameters', () => {
		const extensionName = 'main.logger';
		const root = 'BX';
		const result = 'BX.Main';

		assert(buildNamespaceName({root, extensionName}) === result);
	});

	it('Should return namespace without root if root not passed', () => {
		const extensionName = 'main.logger';
		const result = 'Main';

		assert(buildNamespaceName({extensionName}) === result);
	});

	it('Should return namespace name if passed extension name from subdirectory', () => {
		const extensionName = 'main.logger.message.warn';
		const root = 'BX';
		const result = 'BX.Main.Logger.Message';

		assert(buildNamespaceName({root, extensionName}) === result);
	});

	it('Should return namespace with root only if extensionName doesn\'t passed', () => {
		const root = 'BX';
		const result = 'BX';

		assert(buildNamespaceName({root}) === result);
	});

	it('Should return empty string if params doesn\'t passed', () => {
		assert(buildNamespaceName() === '');
	});

	it('Should return valid namespace', () => {
		const extensionName = 'ui.fonts.opensans.condensed';
		const result = 'BX.UI.Fonts.Opensans';

		assert.deepStrictEqual(buildNamespaceName({root: 'BX', extensionName}), result);
	});
});