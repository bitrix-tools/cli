import assert from 'assert';
import {describe, it} from 'mocha';
import * as fs from 'fs';
import * as efs from 'fs-extra';
import * as path from 'path';
import build from '../../../../src/tools/build';

describe('plugins/rollup/rollup-plugin-files', () => {
	describe('extension', () => {
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

		it('Should resolve imported image with custom output path', async () => {
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

	describe('component', () => {
		it('Should resolve imported image', async () => {
			const componentsPath = path.resolve(__dirname, 'data', 'repo/modules/main/install/components/bitrix/main.ui.grid/templates/.default');
			await build(componentsPath);

			const distImagesPath = path.resolve(componentsPath, 'dist/images/icon.svg');
			assert.ok(fs.existsSync(distImagesPath), 'Image does not exists in destDir');

			const distBundlePath = path.resolve(componentsPath, 'script.js');
			const resultBundlePath = path.resolve(componentsPath, 'result/script.js');
			const distBundle = fs.readFileSync(distBundlePath, 'utf8');
			const resultBundle = fs.readFileSync(resultBundlePath, 'utf8');

			assert.deepStrictEqual(distBundle, resultBundle);

			efs.removeSync(path.resolve(componentsPath, 'dist'));
			efs.removeSync(path.resolve(componentsPath, 'script.js'));
			efs.removeSync(path.resolve(componentsPath, 'script.js.map'));
		});

		it('Should resolve imported image with bundle.config.js', async () => {
			const componentsPath = path.resolve(__dirname, 'data', 'repo/modules/main/install/components/bitrix/main.ui.grid/templates/.default2');
			await build(componentsPath);

			const distImagesPath = path.resolve(componentsPath, 'dist/images/icon.svg');
			assert.ok(fs.existsSync(distImagesPath), 'Image does not exists in destDir');

			const distBundlePath = path.resolve(componentsPath, 'script.js');
			const resultBundlePath = path.resolve(componentsPath, 'result/script.js');
			const distBundle = fs.readFileSync(distBundlePath, 'utf8');
			const resultBundle = fs.readFileSync(resultBundlePath, 'utf8');

			assert.deepStrictEqual(distBundle, resultBundle);

			efs.removeSync(path.resolve(componentsPath, 'dist'));
			efs.removeSync(path.resolve(componentsPath, 'script.js'));
			efs.removeSync(path.resolve(componentsPath, 'script.js.map'));
		});

		it('Should resolve imported image with bundle.config.js and custom output dir', async () => {
			const componentsPath = path.resolve(__dirname, 'data', 'repo/modules/main/install/components/bitrix/main.ui.grid/templates/.default3');
			await build(componentsPath);

			const distImagesPath = path.resolve(componentsPath, 'custom-dist/images/icon.svg');
			assert.ok(fs.existsSync(distImagesPath), 'Image does not exists in destDir');

			const distBundlePath = path.resolve(componentsPath, 'script.js');
			const resultBundlePath = path.resolve(componentsPath, 'result/script.js');
			const distBundle = fs.readFileSync(distBundlePath, 'utf8');
			const resultBundle = fs.readFileSync(resultBundlePath, 'utf8');

			assert.deepStrictEqual(distBundle, resultBundle);

			efs.removeSync(path.resolve(componentsPath, 'custom-dist'));
			efs.removeSync(path.resolve(componentsPath, 'script.js'));
			efs.removeSync(path.resolve(componentsPath, 'script.js.map'));
		});
	});

	describe('template', () => {
		it('Should resolve imported image', async () => {
			const componentsPath = path.resolve(__dirname, 'data', 'repo/modules/main/install/templates/.default');
			await build(componentsPath);

			const distImagesPath = path.resolve(componentsPath, 'dist/images/icon.svg');
			assert.ok(fs.existsSync(distImagesPath), 'Image does not exists in destDir');

			const distBundlePath = path.resolve(componentsPath, 'script.js');
			const resultBundlePath = path.resolve(componentsPath, 'result/script.js');
			const distBundle = fs.readFileSync(distBundlePath, 'utf8');
			const resultBundle = fs.readFileSync(resultBundlePath, 'utf8');

			assert.deepStrictEqual(distBundle, resultBundle);

			efs.removeSync(path.resolve(componentsPath, 'dist'));
			efs.removeSync(path.resolve(componentsPath, 'script.js'));
			efs.removeSync(path.resolve(componentsPath, 'script.js.map'));
		});
	});
});