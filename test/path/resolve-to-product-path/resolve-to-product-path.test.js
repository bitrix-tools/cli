import assert from 'assert';
import * as path from 'path';
import {describe, it} from 'mocha';
import resolveToProductPath from '../../../src/path/resolve-to-product-path';

describe('path/resolveToProductPath', () => {
	describe('extension', () => {
		it('Should return product path if passed valid extension path from repo', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'repo/modules/main/install/js/main/core/core.js');
			const expected = '/bitrix/js/main/core/core.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid extension path from bitrix/modules', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'bitrix/modules/main/install/js/main/core/core.js');
			const expected = '/bitrix/js/main/core/core.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid extension path from local/modules', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'local/modules/main/install/js/main/core/core.js');
			const expected = '/local/js/main/core/core.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid extension path from bitrix/js', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'bitrix/js/main/core/core.js');
			const expected = '/bitrix/js/main/core/core.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid extension path from local/js', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'local/js/main/core/core.js');
			const expected = '/local/js/main/core/core.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});
	});

	describe('component template', () => {
		it('Should return product path if passed valid repo/modules install/component path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'repo/modules/main/install/components/bitrix/main.ui.grid/templates/.default/src/filter.js');
			const expected = '/bitrix/components/bitrix/main.ui.grid/templates/.default/src/filter.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid bitrix/modules install/components path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'bitrix/modules/main/install/components/bitrix/main.ui.grid/templates/.default/src/filter.js');
			const expected = '/bitrix/components/bitrix/main.ui.grid/templates/.default/src/filter.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid local/modules install/components path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'local/modules/main/install/components/bitrix/main.ui.grid/templates/.default/src/filter.js');
			const expected = '/local/components/bitrix/main.ui.grid/templates/.default/src/filter.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid bitrix/components path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'bitrix/components/bitrix/main.ui.grid/templates/.default/src/filter.js');
			const expected = '/bitrix/components/bitrix/main.ui.grid/templates/.default/src/filter.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid local/components path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'local/components/bitrix/main.ui.grid/templates/.default/src/filter.js');
			const expected = '/local/components/bitrix/main.ui.grid/templates/.default/src/filter.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});
	});

	describe('site template', () => {
		it('Should return product path if passed valid repo site template path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'repo/modules/main/install/templates/.default/src/button.js');
			const expected = '/bitrix/templates/.default/src/button.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid bitrix/modules install/templates path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'bitrix/modules/main/install/templates/.default/src/button.js');
			const expected = '/bitrix/templates/.default/src/button.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid local/modules install/templates path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'local/modules/main/install/templates/.default/src/button.js');
			const expected = '/local/templates/.default/src/button.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid bitrix/templates path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'bitrix/templates/.default/src/button.js');
			const expected = '/bitrix/templates/.default/src/button.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});

		it('Should return product path if passed valid local/templates path', () => {
			const sourcePath = path.resolve(__dirname, 'data', 'local/templates/.default/src/button.js');
			const expected = '/local/templates/.default/src/button.js';

			assert.strictEqual(resolveToProductPath(sourcePath), expected);
		});
	});

	it('Should return null if passed invalid path #1', () => {
		const sourcePath = path.resolve(__dirname, 'data', 'templates/.default/src/button.js');
		assert.strictEqual(resolveToProductPath(sourcePath), null);
	});

	it('Should return null if passed invalid path #2', () => {
		const sourcePath = path.resolve(__dirname, 'data', 'js/main/core/src/button.js');
		assert.strictEqual(resolveToProductPath(sourcePath), null);
	});

	it('Should return null if passed invalid path #3', () => {
		const sourcePath = path.resolve(__dirname, 'data', 'local/core/src/button.js');
		assert.strictEqual(resolveToProductPath(sourcePath), null);
	});
});