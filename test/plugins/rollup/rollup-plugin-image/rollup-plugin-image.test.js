import assert from 'assert';
import {describe, it} from 'mocha';
import * as fs from 'fs';
import * as efs from 'fs-extra';
import * as path from 'path';
import build from '../../../../src/tools/build';

describe('plugins/rollup/rollup-plugin-image', () => {
	it('Should resolve imported image', async () => {
		const extensionPath = path.resolve(__dirname, 'data', 'repo/modules/main/install/js/main/app');
		await build(extensionPath);

		const distImagesPath = path.resolve(extensionPath, 'dist/images/icon.svg');
		assert.ok(fs.existsSync(distImagesPath), 'Image does not exists in destDir');

		const distBundlePath = path.resolve(extensionPath, 'dist/app.bundle.js');
		const resultBundlePath = path.resolve(extensionPath, 'result/app.bundle.js');
		const distBundle = fs.readFileSync(distBundlePath, 'utf8');
		const resultBundle = fs.readFileSync(resultBundlePath, 'utf8');

		assert.deepStrictEqual(distBundle, resultBundle);

		efs.removeSync(path.resolve(extensionPath, 'dist'));
	});

	it('Should resolve imported image', async () => {
		const extensionPath = path.resolve(__dirname, 'data', 'repo/modules/main/install/js/main/app2');
		await build(extensionPath);

		const distImagesPath = path.resolve(extensionPath, 'dist/test/images/icon.svg');
		assert.ok(fs.existsSync(distImagesPath), 'Image does not exists in destDir');

		const distBundlePath = path.resolve(extensionPath, 'dist/app.bundle.js');
		const resultBundlePath = path.resolve(extensionPath, 'result/app.bundle.js');
		const distBundle = fs.readFileSync(distBundlePath, 'utf8');
		const resultBundle = fs.readFileSync(resultBundlePath, 'utf8');

		assert.deepStrictEqual(distBundle, resultBundle);

		efs.removeSync(path.resolve(extensionPath, 'dist'));
	});
});