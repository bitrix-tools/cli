'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = _interopDefault(require('os'));
var jsdom = require('jsdom');
var mocha = _interopDefault(require('mocha'));
var assert = _interopDefault(require('assert'));
var sinon = require('sinon');
var path = require('path');
var path__default = _interopDefault(path);
var fs = require('fs');

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os.homedir(), '.bitrix.lock');

function resolvePackageModule(moduleName) {
  return path__default.resolve(appRoot, 'node_modules', moduleName);
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
const DOM = new jsdom.JSDOM(``, {
  url: 'https://example.org/',
  referrer: 'https://example.com/',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000
});
global.window = DOM.window;
global.document = DOM.window.document;
global.Node = DOM.window.Node;
global.Element = DOM.window.Element;
global.DOMParser = DOM.window.DOMParser;
Object.keys(DOM.window).forEach(property => {
  if (typeof global[property] === 'undefined') {
    global[property] = DOM.window[property];
  }
});
global.navigator = {
  userAgent: 'node.js'
};

require('../public/babel-regenerator-runtime');

require.extensions['.css'] = () => null;

require.extensions['.png'] = () => null;

require.extensions['.jpg'] = () => null;

require('@babel/register')({
  cwd: function () {
    const cwd = process.cwd();

    if (cwd.includes('/modules')) {
      return cwd.split('/modules')[0];
    }

    if (cwd.includes('/bitrix')) {
      return cwd.split('/bitrix')[0];
    }

    return path.resolve(cwd, '../../../../../');
  }(),
  presets: [resolvePackageModule('@babel/preset-env'), resolvePackageModule('@babel/preset-react')],
  plugins: [[resolvePackageModule('babel-plugin-module-resolver'), {
    resolvePath: moduleResolver
  }], resolvePackageModule('@babel/plugin-transform-flow-strip-types'), resolvePackageModule('@babel/plugin-proposal-class-properties')],
  exclude: ['**/node_modules**/', '**/babel-external-helpers.js', '**/base-polyfill.js', '**/bundle.core-init.js', '**/bundle.core.js', '**/core/core.js']
});

function moduleResolver(sourcePath, currentFile, opts) {
  const exp = /(^\w+)\.(.*)/;
  const root = currentFile.split('modules')[0];

  if (exp.test(sourcePath)) {
    const modulesPath = path.resolve(root, 'modules');
    const splitedName = sourcePath.split('.');
    const moduleName = splitedName.shift();
    const moduleJsPath = path.resolve(modulesPath, moduleName, 'install', 'js', moduleName);
    const extPath = path.resolve(moduleJsPath, path.join.apply(null, splitedName));
    const configPath = path.resolve(extPath, 'bundle.config.js');

    if (fs.existsSync(configPath)) {
      const config = require(configPath);

      return path.resolve(extPath, config.input);
    }
  }
}
