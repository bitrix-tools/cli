'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var postcss = _interopDefault(require('rollup-plugin-postcss-independed'));
var autoprefixer = _interopDefault(require('autoprefixer'));
var json = _interopDefault(require('rollup-plugin-json'));
var reporter = _interopDefault(require('rollup-plugin-reporter'));
var babel = _interopDefault(require('rollup-plugin-simple-babel'));
require('colors');
var logSymbols = _interopDefault(require('log-symbols'));
var slash = _interopDefault(require('slash'));
var minimist = _interopDefault(require('minimist'));
var Mocha = _interopDefault(require('mocha'));
var glob = _interopDefault(require('fast-glob'));
var os = _interopDefault(require('os'));
var path = require('path');
var path__default = _interopDefault(path);

function isModulePath(filePath) {
  let exp = new RegExp('\/(.[a-z0-9-_]+)\/install\/js\/(.[a-z0-9-_]+)\/');
  let res = slash(filePath).match(exp);
  return !!res && !!res[1] && !!res[2];
}

function buildExtensionName(filePath, context) {
  let exp = new RegExp('\/(.[a-z0-9_-]+)\/install\/js\/(.[a-z0-9_-]+)\/');
  let res = slash(filePath).match(exp);

  if (!Array.isArray(res)) {
    return path.basename(context);
  }

  let fragments = slash(context).split(`${res[1]}/install/js/${res[2]}/`);
  return `${res[2]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
}

function isComponentPath(filePath) {
  let exp = new RegExp('\/(.[a-z0-9]+)\/install\/components\/(.[a-z0-9]+)\/');
  let res = slash(filePath).match(exp);
  return !!res && !!res[1] && !!res[2];
}

function buildComponentName(filePath) {
  filePath = slash(filePath);
  let regExp = new RegExp('\/(.[a-z0-9]+)\/install\/components\/(.[a-z0-9]+)\/');
  let res = filePath.match(regExp);
  return `${res[2]}:${filePath.split(res[0])[1].split('/')[0]}`;
}

function isTemplatePath(filePath) {
  let exp = new RegExp('\/(.[a-z0-9_-]+)\/install\/templates\/(.[a-z0-9_-]+)\/');
  let res = slash(filePath).match(exp);
  return !!res && !!res[1] && !!res[2];
}

function buildTemplateName(filePath) {
  let exp = new RegExp('\/(.[a-z0-9_-]+)\/install\/templates\/(.[a-z0-9_-]+)\/');
  let res = slash(filePath).match(exp);
  return res && res[2];
}

function isEs6File(path$$1) {
  return typeof path$$1 === 'string' && path$$1.endsWith('script.es6.js');
}

const options = {
  dot: true,
  cache: true,
  unique: false
};

function getConfigs(directory) {
  directory = slash(directory);
  const pattern = [path.resolve(directory, '**/bundle.config.js'), path.resolve(directory, '**/script.es6.js')];
  return glob.sync(pattern, options).reduce((acc, file) => {
    let context = path.dirname(file);
    let config = getConfigByFile(file);
    let configs = makeIterable(config);
    configs.forEach(currentConfig => {
      acc.push({
        input: path.resolve(context, currentConfig.input),
        output: path.resolve(context, currentConfig.output),
        name: currentConfig.namespace || '',
        treeshake: currentConfig.treeshake !== false,
        adjustConfigPhp: currentConfig.adjustConfigPhp !== false,
        namespaceFunction: currentConfig.namespaceFunction,
        rel: makeIterable(currentConfig.rel),
        context: path.resolve(context),
        concat: prepareConcat(currentConfig.concat, path.resolve(context))
      });
    });
    return acc;
  }, []);
}

function prepareConcat(files, context) {
  if (typeof files !== 'object') {
    return {};
  }

  files = { ...files
  };
  Object.keys(files).forEach(key => {
    if (Array.isArray(files[key])) {
      files[key] = files[key].map(filePath => {
        return path.resolve(context, filePath);
      });
    }
  });
  return files;
}

function getConfigByFile(configPath) {
  if (isEs6File(configPath)) {
    const context = configPath.replace('script.es6.js', '');
    return {
      input: path.resolve(context, 'script.es6.js'),
      output: path.resolve(context, 'script.js')
    };
  }

  return require(configPath);
}

function makeIterable(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'undefined' && value !== null) {
    return [value];
  }

  return [];
}

class Directory {
  constructor(dir) {
    this.location = dir;
  }

  getConfigs(recursive = true) {
    if (!Directory.configs.has(this.location)) {
      Directory.configs.set(this.location, getConfigs(this.location));
    }

    let configs = Directory.configs.get(this.location);

    if (recursive) {
      return configs;
    }

    let parentConfig = configs.reduce((prevConfig, config) => {
      if (prevConfig) {
        const prevContext = prevConfig.context;
        const currContext = config.context;

        if (prevContext.length < currContext.length) {
          return prevConfig;
        }
      }

      return config;
    }, null);

    if (parentConfig) {
      return configs.filter(config => {
        return config.context === parentConfig.context;
      });
    }

    return configs;
  }

}

Directory.configs = new Map();

function bitrixReporter(bundle, argv = {}) {
  const directory = new Directory(global.currentDirectory || argv.path || argv.p || process.cwd());
  const configs = directory.getConfigs();
  let input = path.resolve(process.cwd(), bundle.bundle);
  let config = configs.find(currentConfig => {
    return path.resolve(currentConfig.context, currentConfig.output).endsWith(bundle.bundle);
  });
  let testsStatus = '';
  let testResult = '';

  if (config && (argv.test || argv.t)) {
    testsStatus = global.testsStatus ? global.testsStatus[config.context] : '';

    if (testsStatus === 'passed') {
      testResult = 'tests passed'.green;
    }

    if (testsStatus === 'failure') {
      testResult = 'tests failed'.red;
    }

    if (testsStatus === 'notests') {
      testResult = 'no tests'.grey;
    }
  }

  if (isModulePath(input)) {
    let name = buildExtensionName(input, config.context);
    console.log(` ${logSymbols.success} Build extension ${name} ${testResult}`);
    return;
  }

  if (isComponentPath(input)) {
    let name = buildComponentName(input);
    console.log(` ${logSymbols.success} Build component ${name} ${testResult}`);
    return;
  }

  if (isTemplatePath(input)) {
    let name = buildTemplateName(input);
    console.log(` ${logSymbols.success} Build template ${name} ${testResult}`);
    return;
  }

  console.log(` ${logSymbols.success} Build bundle ${bundle.bundle} ${testResult}`);
}

var alias = {
  'w': 'watch',
  'p': 'path',
  'm': 'modules',
  't': 'test',
  'h': 'help',
  'v': 'version',
  'c': 'create',
  'n': 'name'
};

var argv = minimist(process.argv.slice(2), {
  alias
});

function namespaceTransformer(options = {}) {
  return {
    name: 'rollup-plugin-namespace-transformer',

    renderChunk(code) {
      if (options.namespaceFunction) {
        let lastLine = code.split(/\r?\n/).pop();
        let parsedNamespace = lastLine.match(/this\.(.*)\s=/);
        let namespace = null;

        if (parsedNamespace && parsedNamespace[1]) {
          namespace = parsedNamespace[1];
        }

        let modifiedLastLine = lastLine.replace(/\((.*?)\)/, `(${options.namespaceFunction}("${namespace}")`);
        code = code.replace(lastLine, modifiedLastLine);
        code = code.replace(/^this(.*) \|\| {};/gm, '').trim();
      }

      return {
        code,
        map: null
      };
    }

  };
}

function invalidateModuleCache(module, recursive, store = []) {
  if (typeof module === 'string') {
    module = require.resolve(module);

    if (require.cache[module] && !store.includes(module)) {
      store.push(module);

      if (Array.isArray(require.cache[module].children) && recursive) {
        require.cache[module].children.forEach(module => {
          invalidateModuleCache(module.id, recursive, store);
        });
      }

      delete require.cache[module];
    }
  }
}

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os.homedir(), '.bitrix.lock');

async function test(dir, report = true) {
  if (Array.isArray(dir)) {
    for (let item of dir) {
      const testStatus = await testDirectory(item, report);
      let testResult = '';

      if (testStatus === 'passed') {
        testResult = 'passed'.green;
      }

      if (testStatus === 'failure') {
        testResult = 'failed'.red;
      }

      if (testStatus === 'notests') {
        testResult = 'no tests'.grey;
      }

      console.log(`Test module ${item}`.bold, `${testResult}`);
    }
  } else if (typeof dir === 'string') {
    return await testDirectory(dir, report);
  } else {
    throw new Error('dir not string or array');
  }
}
function reporterStub() {}
async function testDirectory(dir, report = true) {
  const directory = new Directory(dir);
  const configs = directory.getConfigs();
  const result = [];

  if (!report) {
    global.currentDirectory = path__default.resolve(dir);
  }

  for (const config of configs) {
    const tests = glob.sync(path__default.resolve(config.context, 'test/**/*.js'));

    if (tests.length === 0) {
      result.push('notests');
    }

    const mocha = new Mocha({
      globals: Object.keys(global),
      allowUncaught: true,
      reporter: argv.test || argv.t || !report ? reporterStub : 'spec'
    });

    if (tests.length) {
      tests.forEach(test => {
        const recursive = true;
        invalidateModuleCache(test, recursive);
        mocha.addFile(test);
      });
      appendBootstrap();
      await new Promise(resolve => {
        mocha.run(failures => {
          result.push(failures ? 'failure' : 'passed');
        }).on('end', () => resolve());
      });
    }
  }

  if (result.every(res => res === 'notests')) {
    return 'notests';
  }

  if (result.some(res => res === 'passed') && result.every(res => res !== 'failure')) {
    return 'passed';
  }

  return 'failure';
}

function appendBootstrap() {
  invalidateModuleCache(path__default.resolve(appRoot, 'dist/test.bootstrap.js'));

  require(path__default.resolve(appRoot, 'dist/test.bootstrap.js'));
}

global.testsStatus = global.testsStatus || {};
function rollupMochaTestRunner(options = {}) {
  return {
    name: 'test',

    async onwrite(bundle) {
      if (argv.test || argv.t) {
        const directory = new Directory(global.currentDirectory);
        const configs = directory.getConfigs();
        let config = configs.find(({
          context,
          output
        }) => {
          return path__default.resolve(context, output).endsWith(bundle.file);
        });
        global.testsStatus[config.context] = await test(config.context);
      }
    }

  };
}

function resolvePackageModule(moduleName) {
  return path__default.resolve(appRoot, 'node_modules', moduleName);
}

function rollupConfig({
  input,
  output
}) {
  return {
    input: {
      input: input.input,
      external: ['BX', 'react', 'react-dom'],
      treeshake: input.treeshake !== false,
      plugins: [json(), postcss({
        extract: true,
        sourceMap: false,
        plugins: [autoprefixer({
          browsers: ['ie >= 11', 'last 4 version']
        })]
      }), babel({
        sourceMaps: true,
        presets: [resolvePackageModule('@babel/preset-env'), resolvePackageModule('@babel/preset-react')],
        plugins: [resolvePackageModule('@babel/plugin-external-helpers'), resolvePackageModule('@babel/plugin-transform-flow-strip-types'), resolvePackageModule('@babel/plugin-proposal-class-properties'), resolvePackageModule('@babel/plugin-proposal-private-methods')]
      }), rollupMochaTestRunner(), namespaceTransformer({
        namespaceFunction: function () {
          if (output.namespaceFunction === null) {
            return output.namespaceFunction;
          }

          if (typeof output.namespaceFunction === 'string') {
            return output.namespaceFunction;
          }

          return 'BX.namespace';
        }()
      }), reporter({
        exclude: ['style.js'],
        report: bundle => {
          if (argv.report !== false) {
            bitrixReporter(bundle, argv);
          }
        }
      })],
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
        'BX': 'BX',
        'react': 'React',
        'react-dom': 'ReactDOM',
        'window': 'window',
        ...output.globals
      }
    }
  };
}

module.exports = rollupConfig;
