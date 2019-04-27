'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var postcss = _interopDefault(require('rollup-plugin-postcss-independed'));
var autoprefixer = _interopDefault(require('autoprefixer'));
var json = _interopDefault(require('rollup-plugin-json'));
var babel = _interopDefault(require('rollup-plugin-simple-babel'));
var resolve = _interopDefault(require('rollup-plugin-node-resolve'));
var commonjs = _interopDefault(require('rollup-plugin-commonjs'));
var os = _interopDefault(require('os'));
var path = require('path');
var path__default = _interopDefault(path);
var fs = require('fs');
var jscharder = _interopDefault(require('jschardet'));
var iconv = require('iconv-lite');
var iconv__default = _interopDefault(iconv);

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os.homedir(), '.bitrix.lock');

function resolvePackageModule(moduleName) {
  return path__default.resolve(appRoot, 'node_modules', moduleName);
}

function getEncoding(buffer) {
  const result = jscharder.detect(buffer);

  if (!result || result.encoding === 'UTF-8' || result.encoding === 'ascii') {
    return 'utf-8';
  }

  return 'windows-1251';
}

function rollupConfig({
  input,
  output,
  plugins = {}
}) {
  const enabledPlugins = [];

  const isLoaded = id => !!enabledPlugins.find(item => item.name === id);

  if (Array.isArray(plugins.custom)) {
    plugins.custom.forEach(item => {
      enabledPlugins.push(item);
    });
  }

  if (plugins.resolve && !isLoaded('node-resolve')) {
    enabledPlugins.push(resolve());
  }

  if (!isLoaded('json')) {
    enabledPlugins.push(json());
  }

  if (!isLoaded('postcss')) {
    enabledPlugins.push(postcss({
      extract: true,
      sourceMap: false,
      plugins: [autoprefixer({
        browsers: ['ie >= 11', 'last 4 version']
      })]
    }));
  }

  if (plugins.babel !== false) {
    enabledPlugins.push(babel(plugins.babel || {
      sourceMaps: true,
      presets: [[resolvePackageModule('@babel/preset-env'), {
        targets: {
          ie: '11'
        }
      }]],
      plugins: [resolvePackageModule('@babel/plugin-external-helpers'), resolvePackageModule('@babel/plugin-transform-flow-strip-types'), resolvePackageModule('@babel/plugin-proposal-class-properties'), resolvePackageModule('@babel/plugin-proposal-private-methods')]
    }));
  }

  if (plugins.resolve && !isLoaded('commonjs')) {
    enabledPlugins.push(commonjs({
      sourceMap: false
    }));
  }

  return {
    input: {
      input: input.input,
      external: ['BX'],
      treeshake: input.treeshake !== false,
      plugins: [{
        load(id) {
          if (!fs.existsSync(id)) {
            return null;
          }

          const file = fs.readFileSync(id);
          const fileEncoding = getEncoding(file);
          const decoded = iconv__default.decode(file, fileEncoding);
          const encoded = iconv__default.encode(decoded, 'utf-8');
          return encoded.toString('utf-8');
        }

      }, ...enabledPlugins],
      onwarn: () => {}
    },
    output: {
      file: output.file,
      name: output.name || 'window',
      format: 'iife',
      sourcemap: true,
      extend: true,
      exports: 'named',
      globals: {
        BX: 'BX',
        window: 'window',
        ...output.globals
      }
    }
  };
}

module.exports = rollupConfig;
