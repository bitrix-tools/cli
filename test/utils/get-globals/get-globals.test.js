import getGlobals from '../../../src/utils/get-globals';
import assert from 'assert';
import path from 'path';

const projectRoot = path.resolve(__dirname, 'data');
const vendorModuleDir = path.resolve(__dirname, 'data/bitrix/modules/vendor.mymodule');
const vendorModuleJsDir = path.resolve(__dirname, 'data/bitrix/js/vendor/mymodule');

const testInclusionFrom = (context) => {
	it('Should resolve partner extension to path under bitrix/js', () => {
		const expected = {
			'vendor.mymodule.myext': 'BX.Vendor.MyModule.MyExt'
		};
		const actual = getGlobals(['vendor.mymodule.myext'], {context});

		assert.deepEqual(actual, expected);
	});
	it('Should not resolve partner extension to bitrix/modules/<module>/install/js', () => {
		const expected = {
			'vendor.mymodule.myext-in-module-only': 'BX'
		};
		const actual = getGlobals(['vendor.mymodule.myext-in-module-only'], {context});

		assert.deepEqual(actual, expected);
	});

	it('bitrix/js should have precedence over bitrix/modules/<module>/install/js', () => {
		const expected = {
			'vendor.mymodule.myext': 'BX.Vendor.MyModule.MyExt'
		};
		const notExpected = {
			'vendor.mymodule.myext': 'BX.Vendor.MyModule.MyExtInModuleOnly'
		};
		const actual = getGlobals(['vendor.mymodule.myext'], {context});

		assert.deepEqual(actual, expected);
		assert.notDeepEqual(actual, notExpected);
	});

	it('local/ should have precedence over bitrix/ paths', () => {
		const expected = {
			'vendor.mymodule.myext-in-local': 'BX.Vendor.MyModule.MyExtInLocal'
		};
		const notExpected = {
			'vendor.mymodule.myext-in-local': 'BX.Vendor.MyModule.MyExtInBitrix'
		};
		const actual = getGlobals(['vendor.mymodule.myext-in-local'], {context});

		assert.deepEqual(actual, expected);
		assert.notDeepEqual(actual, notExpected);
	});
}

describe('utils/get-globals', () => {
	it('Should be exported as function', () => {
		assert(typeof getGlobals === 'function');
	});

	describe('With site templates context', () => {
		const context = path.join(projectRoot, 'bitrix/templates/mytemplate/components/vendor.component/templates/.default');
		testInclusionFrom(context);
	});

	describe('With component template context', () => {
		const context = path.join(projectRoot, 'bitrix/components/vendor/component/templates/my-template');
		testInclusionFrom(context);
	});

	describe('With third-party extension\'s context', () => {
		const context = path.join(projectRoot, 'bitrix/js/vendor2/third-patry-extenion');
		testInclusionFrom(context);
	});
});