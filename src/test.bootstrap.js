import {JSDOM} from 'jsdom';
import mocha from 'mocha';
import assert from 'assert';
import * as sinon from 'sinon';
import {resolve, join} from 'path';
import {existsSync} from 'fs';
import v8 from 'v8';
import vm from 'vm';
import resolvePackageModule from './utils/resolve-package-module';

v8.setFlagsFromString('--expose-gc');
global.gc = vm.runInNewContext('gc');

let weak;
try {
	// eslint-disable-next-line global-require,import/no-extraneous-dependencies
	weak = require('weak');
} catch (e) {
	weak = (obj, callback) => {
		callback();
		console.warn('@bitrix/cli: weak is not installed');
	};
}

global.sinon = sinon;
global.assert = assert;
global.describe = mocha.describe;
global.it = mocha.it;
global.xit = mocha.xit;
global.before = mocha.before;
global.beforeEach = mocha.beforeEach;
global.after = mocha.after;
global.afterEach = mocha.afterEach;
global.setup = mocha.setup;
global.suite = mocha.suite;
global.suiteSetup = mocha.suiteSetup;
global.suiteTeardown = mocha.suiteTeardown;
global.teardown = mocha.teardown;
global.test = mocha.test;
global.run = mocha.run;
global.weak = weak;

const DOM = new JSDOM('', {
	url: 'https://example.org/',
	referrer: 'https://example.com/',
	contentType: 'text/html',
	includeNodeLocations: true,
	storageQuota: 10000000,
});

global.window = DOM.window;
global.document = DOM.window.document;
global.Node = DOM.window.Node;
global.Element = DOM.window.Element;
global.DOMParser = DOM.window.DOMParser;
global.FormData = DOM.window.FormData;
global.File = DOM.window.File;
global.Blob = DOM.window.Blob;
global.BlobBuilder = DOM.window.BlobBuilder;
global.FileReader = DOM.window.FileReader;

Object.keys(DOM.window).forEach((property) => {
	if (typeof global[property] === 'undefined') {
		global[property] = DOM.window[property];
	}
});

global.navigator = {
	userAgent: 'node.js',
};

require('../public/babel-regenerator-runtime');

require.extensions['.css'] = () => null;
require.extensions['.png'] = () => null;
require.extensions['.jpg'] = () => null;

function moduleResolver(sourcePath, currentFile) {
	const exp = /(^\w+)\.(.*)/;
	const root = currentFile.split('modules')[0];

	if (exp.test(sourcePath)) {
		const modulesPath = resolve(root, 'modules');
		const splitedName = sourcePath.split('.');
		const moduleName = splitedName.shift();

		const moduleJsPath = resolve(modulesPath, moduleName, 'install', 'js', moduleName);
		const extPath = resolve(moduleJsPath, join(...splitedName));

		const configPath = resolve(extPath, 'bundle.config.js');

		if (existsSync(configPath)) {
			// eslint-disable-next-line
			const config = require(configPath);
			return resolve(extPath, config.input);
		}
	}

	return '';
}

require('@babel/register')({
	cwd: (() => {
		const cwd = process.cwd();

		if (cwd.includes('/modules')) {
			return cwd.split('/modules')[0];
		}

		if (cwd.includes('/bitrix')) {
			return cwd.split('/bitrix')[0];
		}

		return resolve(cwd, '../../../../../');
	})(),
	presets: [
		resolvePackageModule('@babel/preset-env'),
	],
	plugins: [
		[resolvePackageModule('babel-plugin-module-resolver'), {
			resolvePath: moduleResolver,
		}],
		resolvePackageModule('@babel/plugin-transform-flow-strip-types'),
		resolvePackageModule('@babel/plugin-proposal-class-properties'),
		resolvePackageModule('@babel/plugin-proposal-private-methods'),
	],
});