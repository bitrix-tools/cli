import {JSDOM} from 'jsdom';
import mocha from 'mocha';
import assert from 'assert';
import sinon from 'sinon';
import path from 'path';
import v8 from 'v8';
import vm from 'vm';
import resolvePackageModule from './utils/resolve-package-module';
import resolveExtension from './utils/resolve-extension';
import loadMessages from './utils/load-messages';

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
global.loadMessages = loadMessages;

const DOM = new JSDOM('', {
	url: 'https://example.org/',
	referrer: 'https://example.com/',
	contentType: 'text/html',
	includeNodeLocations: true,
	storageQuota: 10000000,
	pretendToBeVisual: true,
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

require('../public/babel-regenerator-runtime');

require.extensions['.css'] = () => null;
require.extensions['.png'] = () => null;
require.extensions['.jpg'] = () => null;

function isExtensionName(value: string) {
	return /(^\w+)\.(.*)/.test(String(value));
}

function moduleResolver(sourcePath, currentFile) {
	if (isExtensionName(sourcePath))
	{
		const resolverResult = resolveExtension({
			name: sourcePath,
			sourcePath: currentFile,
		});

		if (resolverResult)
		{
			return resolverResult.input;
		}

		return 'assert';
	}

	if (
		!sourcePath.startsWith('.')
		&& !currentFile.includes('@bitrix')
		&& !currentFile.includes('node_modules')
		&& !currentFile.endsWith('.test.js')
	)
	{
		return 'assert';
	}

	return '';
}

require('@babel/register')({
	cwd: (() => {
		const cwd = process.cwd();

		if (cwd.includes('/modules')) {
			return path.resolve(cwd.split('/modules')[0], '../../../../../');
		}

		if (cwd.includes('/bitrix')) {
			return path.resolve(cwd.split('/bitrix')[0], '../../../../../');
		}

		return path.resolve(cwd, '../../../../../');
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
