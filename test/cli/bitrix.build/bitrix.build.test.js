import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import bitrixBuild from '../../../src/cli/bitrix.build';
import * as sinon from 'sinon';
import {FSWatcher} from 'chokidar';
import {EventEmitter} from "events";

const modules = path.resolve(__dirname, 'data/modules');

const extensions = [
	path.resolve(modules, 'main/install/js/main/extension'),
	path.resolve(modules, 'main/install/js/main/extension/child1'),
	path.resolve(modules, 'main/install/js/main/extension/child2'),
	path.resolve(modules, 'main/install/components/bitrix/test/templates/.default'),
	path.resolve(modules, 'ui/install/js/ui/extension')
];

describe('cli/bitrix.build', () => {
	beforeEach(() => {
		extensions.forEach(ext => removeDist(path.resolve(ext, 'dist')));
	});

	afterEach(() => {
		extensions.forEach(ext => removeDist(path.resolve(ext, 'dist')));
	});

	it('Should be exported as function', () => {
		assert(typeof bitrixBuild === 'function');
	});

	it('Should build extension by extension path from params.path (#result1)', async () => {
		bitrixBuild.__Rewire__('argv', {});

		for (let extPath of extensions) {
			await bitrixBuild({path: extPath});
			void checkBuild(extPath, true);
		}
	});

	it('Should build module by argv.path and argv.modules (#result1)', async () => {
		const samples = [
			{
				path: path.resolve(__dirname, 'data/modules'),
				modules: [
					path.resolve(__dirname, 'data/modules/main')
				],
				ext: [
					path.resolve(__dirname, 'data/modules/main/install/js/main/extension')
				]
			},
			{
				path: path.resolve(__dirname, 'data/modules'),
				modules: [
					path.resolve(__dirname, 'data/modules/ui')
				],
				ext: [
					path.resolve(__dirname, 'data/modules/ui/install/js/ui/extension')
				]
			},
			{
				path: path.resolve(__dirname, 'data/modules'),
				modules: [
					path.resolve(__dirname, 'data/modules/main'),
					path.resolve(__dirname, 'data/modules/ui')
				],
				ext: [
					path.resolve(__dirname, 'data/modules/main/install/js/main/extension'),
					path.resolve(__dirname, 'data/modules/ui/install/js/ui/extension')
				]
			}
		];

		bitrixBuild.__Rewire__('argv', {});

		for (let sample of samples) {
			await bitrixBuild(sample);

			for (let ext of sample.ext) {
				await checkBuild(ext, true);
			}
		}
	});

	it('Should build all modules by repository root (#result1)', async () => {
		bitrixBuild.__Rewire__('argv', {});

		await bitrixBuild({path: path.resolve(__dirname, 'data/modules')});

		for (let ext of extensions) {
			await checkBuild(ext, true);
		}
	});

	it('Should return undefined', async () => {
		bitrixBuild.__Rewire__('argv', {});

		const result = await bitrixBuild({path: path.resolve(__dirname, 'data/modules')});

		assert(typeof result === 'undefined');
	});

	// with --watch param

	it('Should return watcher and emitter', async () => {
		const extPath = path.resolve(__dirname, 'data/modules/main/install/js/main/extension');
		const buildStub = sinon.stub();
		const oraStub = sinon.stub();

		oraStub.prototype.start = sinon.stub();
		oraStub.prototype.succeed = sinon.stub();

		bitrixBuild.__Rewire__('Ora', oraStub);
		bitrixBuild.__Rewire__('bitrixBuild', () => {});
		bitrixBuild.__Rewire__('build', buildStub);
		bitrixBuild.__Rewire__('argv', {watch: true});

		const result = await bitrixBuild({
			path: extPath
		});

		assert(result.watcher instanceof FSWatcher);
		assert(result.emitter instanceof EventEmitter);

		await new Promise(resolve => {
			result.emitter
				.on('ready', () => {
					resolve();
					result.watcher.close();
				});
		});
	});

	it('Should add watcher on extension directory', async () => {
		const extPath = path.resolve(__dirname, 'data/modules/main/install/js/main/extension');
		const buildStub = sinon.stub();
		const oraStub = sinon.stub();

		oraStub.prototype.start = sinon.stub();
		oraStub.prototype.succeed = sinon.stub();

		bitrixBuild.__Rewire__('Ora', oraStub);
		bitrixBuild.__Rewire__('bitrixBuild', () => {});
		bitrixBuild.__Rewire__('build', buildStub);
		bitrixBuild.__Rewire__('argv', {watch: true});

		const result = await bitrixBuild({
			path: extPath
		});

		await new Promise(resolve => {
			result.emitter
				.on('ready', () => {
					result.watcher.close();
					resolve();
				});
		});
	});

	it('Should add watcher for all modules', async () => {
		const modules = [
			path.resolve(__dirname, 'data/modules/main/install/js/main/extension'),
			path.resolve(__dirname, 'data/modules/ui/install/js/ui/extension')
		];

		const buildStub = sinon.stub();
		const oraStub = sinon.stub();

		oraStub.prototype.start = sinon.stub();
		oraStub.prototype.succeed = sinon.stub();

		bitrixBuild.__Rewire__('Ora', oraStub);
		bitrixBuild.__Rewire__('bitrixBuild', () => {});
		bitrixBuild.__Rewire__('build', buildStub);
		bitrixBuild.__Rewire__('argv', {watch: true});

		const result = await bitrixBuild({ modules });

		await new Promise(resolve => {
			result.emitter
				.on('ready', () => {
					result.watcher.close();
					resolve();
				});
		});
	});

	it('Should call build if file changes', async () => {
		const buildStub = sinon.stub();
		const oraStub = sinon.stub();

		oraStub.prototype.start = sinon.stub();
		oraStub.prototype.succeed = sinon.stub();

		bitrixBuild.__Rewire__('Ora', oraStub);
		bitrixBuild.__Rewire__('bitrixBuild', () => {});
		bitrixBuild.__Rewire__('build', buildStub);
		bitrixBuild.__Rewire__('argv', {watch: true});

		const extPath = extensions[0];
		const result = await bitrixBuild({
			path: extPath
		});

		result.emitter
			.emit('change', {context: 'test'});

		assert(buildStub.called);
		assert(buildStub.lastCall.args[0] === 'test');
		assert(buildStub.lastCall.args[1] === false);

		result.watcher.close();
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
		const styleJsPath = path.resolve(extPath, 'style.js.map');
		const styleJsMapPath = path.resolve(extPath, 'style.js.map');
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

		if (fs.existsSync(styleJsPath)) {
			assertion && assert(false, `${path.basename(styleJsPath)} exists`);
			return false;
		}

		if (fs.existsSync(styleJsMapPath)) {
			assertion && assert(false, `${path.basename(styleJsMapPath)} exists`);
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
		console.log('extPath:', extPath);
		assertion && assert.deepEqual(distBundleJs, resBundleJs, `invalid ${path.basename(distBundleJsPath)}`);
		return false;
	}

	if (distBundleJsMap !== resBundleJsMap) {
		console.log('extPath:', extPath);
		assertion && assert.deepEqual(distBundleJsMap, resBundleJsMap, `invalid ${path.basename(distBundleJsMapPath)}`);
		return false;
	}

	if (distBundleCss !== resBundleCss) {
		console.log('extPath:', extPath);
		assertion && assert.deepEqual(distBundleCss, resBundleCss, `invalid ${path.basename(distBundleCssPath)}`);
		return false;
	}

	if (distConfigPhp !== resConfigPhp) {
		console.log('extPath:', extPath);
		assertion && assert.deepEqual(distConfigPhp, resConfigPhp, `invalid ${path.basename(distConfigPhpPath)}`);
		return false;
	}

	return true;
}