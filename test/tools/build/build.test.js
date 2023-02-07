import assert from 'assert';
import build from '../../../src/tools/build';
import path from 'path';
import fs from 'fs';

const modules = path.resolve(__dirname, 'data/modules');

const extensions = [
	path.resolve(modules, 'main/install/js/main/extension'),
	path.resolve(modules, 'main/install/js/main/extension/child1'),
	path.resolve(modules, 'main/install/js/main/extension/child2'),
	path.resolve(modules, 'main/install/components/bitrix/test/templates/.default'),
	path.resolve(modules, 'ui/install/js/ui/extension'),
	path.resolve(modules, 'main/install/js/main/withcore')
];

const moduleWithoutExtensions = path.resolve(modules, 'iblock');

const RECURSIVE = true;
const NOT_RECURSIVE = false;
const WITH_ASSERTION = true;

describe('tools/build', () => {
	beforeEach(() => {
		extensions.forEach(ext => removeDist(path.resolve(ext, 'dist')));
	});

	afterEach(() => {
		extensions.forEach(ext => removeDist(path.resolve(ext, 'dist')));
	});

	it('Should be imported as function', () => {
		assert(typeof build === 'function');
	});

	it('Should build extension from passed directory not recursive', async () => {
		const parentExt = extensions[0];
		const childExt1 = extensions[1];
		const childExt2 = extensions[2];

		await build(parentExt, NOT_RECURSIVE);

		assert(checkBuild(parentExt, WITH_ASSERTION) === true);
		assert(checkBuild(childExt1) === false);
		assert(checkBuild(childExt2) === false);
	});

	it('Should build all extensions from passed directory recursive', async () => {
		const parentExt = extensions[0];
		const childExt1 = extensions[1];
		const childExt2 = extensions[2];

		await build(parentExt, RECURSIVE);

		assert(checkBuild(parentExt, WITH_ASSERTION) === true);
		assert(checkBuild(childExt1, WITH_ASSERTION) === true);
		assert(checkBuild(childExt2, WITH_ASSERTION) === true);
	});

	it('Should build recursive by default', async () => {
		const parentExt = extensions[0];
		const childExt1 = extensions[1];
		const childExt2 = extensions[2];

		await build(parentExt);

		assert(checkBuild(parentExt, WITH_ASSERTION) === true);
		assert(checkBuild(childExt1, WITH_ASSERTION) === true);
		assert(checkBuild(childExt2, WITH_ASSERTION) === true);
	});

	it('Should build all extensions from passed modules directory', async () => {
		await build(modules, RECURSIVE);

		await new Promise((resolve) => {
			extensions.forEach(extPath => {
				checkBuild(extPath, WITH_ASSERTION);
			});
			resolve();
		});
	});

	it('Should throws if passed invalid directory', async () => {
		await assert.rejects(build(null));
		await assert.rejects(build({}));
		await assert.rejects(build(12));
		await assert.rejects(build(false));
		await assert.rejects(build(true));
		await assert.rejects(build());
	});

	it('Should do nothing if not configs found', async () => {
		await build(moduleWithoutExtensions, RECURSIVE);

		extensions.forEach(extPath => {
			assert(checkBuild(extPath) === false);
		});
	});

	it('Should do not replace config.php if exists', async () => {
		const extPath = extensions[0];
		const configPhpPath = path.resolve(extPath, 'config.php');

		fs.writeFileSync(configPhpPath, 'test');

		await build(extPath, NOT_RECURSIVE);

		const configPhp = fs.readFileSync(configPhpPath, 'utf-8');

		assert(configPhp === 'test');
	});
});

function removeDist(distPath) {
	if (distPath.includes(path.join('components', 'bitrix'))) {
		if (fs.existsSync(path.resolve(distPath, '../script.js'))) {
			fs.unlinkSync(path.resolve(distPath, '../script.js'));
		}

		if (fs.existsSync(path.resolve(distPath, '../script.js.map'))) {
			fs.unlinkSync(path.resolve(distPath, '../script.js.map'));
		}

		if (fs.existsSync(path.resolve(distPath, '../style.css'))) {
			fs.unlinkSync(path.resolve(distPath, '../style.css'));
		}

		return;
	}

	if (fs.existsSync(distPath)) {
		if (fs.existsSync(path.resolve(distPath, 'app.bundle.js'))) {
			fs.unlinkSync(path.resolve(distPath, 'app.bundle.js'));
			fs.unlinkSync(path.resolve(distPath, 'app.bundle.js.map'));
		}

		if (fs.existsSync(path.resolve(distPath, 'app.bundle.css'))) {
			fs.unlinkSync(path.resolve(distPath, 'app.bundle.css'));
		}

		if (fs.existsSync(path.resolve(distPath, '../config.php'))) {
			fs.unlinkSync(path.resolve(distPath, '../config.php'));
		}

		fs.rmdir(distPath, () => {});
	}
}

function checkBuild(extPath, assertion = false) {
	if (extPath.includes(path.join('components', 'bitrix'))) {
		const scriptJsPath = path.resolve(extPath, 'script.js');
		const scriptJsMapPath = path.resolve(extPath, 'script.js.map');
		const styleCssPath = path.resolve(extPath, 'style.css');
		const configPhpPath = path.resolve(extPath, 'config.php');

		if (!fs.existsSync(scriptJsPath)) {
			assertion && assert(false, `${path.basename(scriptJsPath)} not exists`);
			return false;
		}

		if (!fs.existsSync(scriptJsMapPath)) {
			assertion && assert(false, `${path.basename(scriptJsMapPath)} not exists`);
			return false;
		}

		if (!fs.existsSync(styleCssPath)) {
			assertion && assert(false, `${path.basename(styleCssPath)} not exists`);
			return false;
		}

		if (fs.existsSync(configPhpPath)) {
			assertion && assert(false, `${path.basename(configPhpPath)} exists`);
			return false;
		}

		return true;
	}

	const distPath = path.resolve(extPath, 'dist');
	const resultPath = path.resolve(extPath, 'result/result1');

	const distBundleJsPath = path.resolve(distPath, 'app.bundle.js');
	const distBundleJsMapPath = path.resolve(distPath, 'app.bundle.js.map');
	const distBundleCssPath = path.resolve(distPath, 'app.bundle.css');
	const distConfigPhpPath = path.resolve(extPath, 'config.php');

	const resBundleJsPath = path.resolve(resultPath, 'app.bundle.js');
	const resBundleJsMapPath = path.resolve(resultPath, 'app.bundle.js.map');
	const resBundleCssPath = path.resolve(resultPath, 'app.bundle.css');
	const resConfigPhpPath = path.resolve(resultPath, 'config.php');

	if (!fs.existsSync(distPath)) {
		assertion && assert(false, `dist not exists ${distPath}`);
		return false;
	}

	if (!fs.existsSync(distBundleJsPath)) {
		assertion && assert(false, `${path.basename(distBundleJsPath)} not exists`);
		return false;
	}

	if (!fs.existsSync(distBundleJsMapPath)) {
		assertion && assert(false, `${path.basename(distBundleJsMapPath)} not exists`);
		return false;
	}

	if (!fs.existsSync(distBundleCssPath)) {
		assertion && assert(false, `${path.basename(distBundleCssPath)} not exists`);
		return false;
	}

	if (!fs.existsSync(distConfigPhpPath)) {
		assertion && assert(false, `${path.basename(distConfigPhpPath)} not exists`);
		return false;
	}

	const distBundleJs = fs.readFileSync(distBundleJsPath, 'utf-8');
	const distBundleJsMap = fs.readFileSync(distBundleJsMapPath, 'utf-8');
	const distBundleCss = fs.readFileSync(distBundleCssPath, 'utf-8');
	const distConfigPhp = fs.readFileSync(distConfigPhpPath, 'utf-8');

	const resBundleJs = fs.readFileSync(resBundleJsPath, 'utf-8');
	const resBundleJsMap = fs.readFileSync(resBundleJsMapPath, 'utf-8');
	const resBundleCss = fs.readFileSync(resBundleCssPath, 'utf-8');
	const resConfigPhp = fs.readFileSync(resConfigPhpPath, 'utf-8');

	if (distBundleJs !== resBundleJs) {
		console.log('extPath', extPath);
		assertion && assert.deepEqual(distBundleJs, resBundleJs, `invalid ${path.basename(distBundleJsPath)}`);
		return false;
	}

	if (distBundleJsMap !== resBundleJsMap) {
		console.log('extPath', extPath);
		assertion && assert.deepEqual(distBundleJsMap, resBundleJsMap, `invalid ${path.basename(distBundleJsMapPath)}`);
		return false;
	}

	if (distBundleCss !== resBundleCss) {
		console.log('extPath', extPath);
		assertion && assert.deepEqual(distBundleCss, resBundleCss, `invalid ${path.basename(distBundleCssPath)}`);
		return false;
	}

	if (distConfigPhp !== resConfigPhp) {
		console.log('extPath', extPath);
		assertion && assert.deepStrictEqual(distConfigPhp, resConfigPhp, `invalid ${path.basename(distConfigPhpPath)}`);
		return false;
	}

	return true;
}