import assert from 'assert';
import {describe, it} from 'mocha';
import * as fs from 'fs';
import * as efs from 'fs-extra';
import * as path from 'path';
import build from '../../../../src/tools/build';

describe('plugins/postcss/postcss-background-url', () => {
	describe('extension', () => {
		it('Should convert to inline image', async () => {
			const extensionPath = path.resolve(__dirname, 'data', 'repo/modules/main/install/js/main/core');
			await build(extensionPath);

			const copiedImagePath = path.resolve(extensionPath, 'dist/images/big.jpg');
			assert.ok(fs.existsSync(copiedImagePath), 'Image does not exists in dest dir');

			const bundleCssPath = path.resolve(extensionPath, 'dist/core.bundle.css');
			const resultCssPath = path.resolve(extensionPath, 'result/core.bundle.css');
			const bundleCssContent = fs.readFileSync(bundleCssPath, 'utf8');
			const resultCssContent = fs.readFileSync(resultCssPath, 'utf8');

			assert.deepStrictEqual(bundleCssContent, resultCssContent);

			efs.removeSync(path.resolve(extensionPath, 'dist'));
		});
	});
});