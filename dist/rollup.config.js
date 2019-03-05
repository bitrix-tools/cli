'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var postcss = _interopDefault(require('rollup-plugin-postcss-independed'));
var autoprefixer = _interopDefault(require('autoprefixer'));
var json = _interopDefault(require('rollup-plugin-json'));
var reporter = _interopDefault(require('rollup-plugin-reporter'));
var babel = _interopDefault(require('rollup-plugin-simple-babel'));
var resolve = _interopDefault(require('rollup-plugin-node-resolve'));
var commonjs = _interopDefault(require('rollup-plugin-commonjs'));
var minimist = _interopDefault(require('minimist'));
require('colors');
var logSymbols = _interopDefault(require('log-symbols'));
var slash = _interopDefault(require('slash'));
var Mocha = _interopDefault(require('mocha'));
var glob = _interopDefault(require('fast-glob'));
var os = _interopDefault(require('os'));
var Logger = _interopDefault(require('@bitrix/logger'));
var path = require('path');
var path__default = _interopDefault(path);

var alias = {
  w: 'watch',
  p: 'path',
  m: 'modules',
  t: 'test',
  h: 'help',
  v: 'version',
  c: 'create',
  n: 'name'
};

var argv = minimist(process.argv.slice(2), {
  alias
});

function isModulePath(filePath) {
  const exp = new RegExp('/(.[a-z0-9-_]+)/install/js/(.[a-z0-9-_]+)/');
  const res = `${slash(filePath)}`.match(exp);
  return !!res && !!res[1] && !!res[2];
}

function buildExtensionName(filePath, context) {
  const exp = new RegExp('/(.[a-z0-9_-]+)/install/js/(.[a-z0-9_-]+)/');
  const res = `${slash(filePath)}`.match(exp);

  if (!Array.isArray(res)) {
    return path.basename(context);
  }

  const fragments = `${slash(context)}`.split(`${res[1]}/install/js/${res[2]}/`);
  return `${res[2]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
}

function isComponentPath(filePath) {
  const exp = new RegExp('/(.[a-z0-9]+)/install/components/(.[a-z0-9]+)/');
  const res = `${slash(filePath)}`.match(exp);
  return !!res && !!res[1] && !!res[2];
}

function buildComponentName(filePath) {
  const normalizedPath = `${slash(filePath)}`;
  const regExp = new RegExp('/(.[a-z0-9]+)/install/components/(.[a-z0-9]+)/');
  const res = normalizedPath.match(regExp);
  return `${res[2]}:${normalizedPath.split(res[0])[1].split('/')[0]}`;
}

function isTemplatePath(filePath) {
  const exp = new RegExp('/(.[a-z0-9_-]+)/install/templates/(.[a-z0-9_-]+)/');
  const res = `${slash(filePath)}`.match(exp);
  return !!res && !!res[1] && !!res[2];
}

function buildTemplateName(filePath) {
  const exp = new RegExp('/(.[a-z0-9_-]+)/install/templates/(.[a-z0-9_-]+)/');
  const res = `${slash(filePath)}`.match(exp);
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

function prepareConcat(files, context) {
  if (typeof files !== 'object') {
    return {};
  }

  const result = {};
  Object.keys(files).forEach(key => {
    if (Array.isArray(files[key])) {
      result[key] = files[key].map(filePath => path.resolve(context, filePath));
    }
  });
  return result;
}

function getConfigByFile(configPath) {
  if (isEs6File(configPath)) {
    const context = configPath.replace('script.es6.js', '');
    return {
      input: path.resolve(context, 'script.es6.js'),
      output: path.resolve(context, 'script.js')
    };
  } // eslint-disable-next-line


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

function getConfigs(directory) {
  const normalizedDirectory = `${slash(directory)}`;
  const pattern = [path.resolve(normalizedDirectory, '**/bundle.config.js'), path.resolve(normalizedDirectory, '**/script.es6.js')];
  return glob.sync(pattern, options).reduce((acc, file) => {
    const context = path.dirname(file);
    const config = getConfigByFile(file);
    const configs = makeIterable(config);
    configs.forEach(currentConfig => {
      let {
        plugins
      } = currentConfig;

      if (typeof plugins !== 'object') {
        plugins = {};
      }

      acc.push({
        input: path.resolve(context, currentConfig.input),
        output: path.resolve(context, currentConfig.output),
        name: currentConfig.namespace || '',
        treeshake: currentConfig.treeshake !== false,
        adjustConfigPhp: currentConfig.adjustConfigPhp !== false,
        protected: currentConfig.protected === true,
        rel: makeIterable(currentConfig.rel),
        plugins,
        context: path.resolve(context),
        concat: prepareConcat(currentConfig.concat, path.resolve(context))
      });
    });
    return acc;
  }, []);
}

class Directory {
  constructor(dir) {
    this.location = dir;
  }

  getConfigs(recursive = true) {
    if (!Directory.configs.has(this.location)) {
      const configs = getConfigs(this.location).filter(config => {
        if (config.protected) {
          return config.context === this.location;
        }

        return config;
      });
      Directory.configs.set(this.location, configs);
    }

    const configs = Directory.configs.get(this.location);

    if (recursive) {
      return configs;
    }

    const parentConfig = configs.reduce((prevConfig, config) => {
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
      return configs.filter(config => config.context === parentConfig.context);
    }

    return configs;
  }

}

Directory.configs = new Map();

function bitrixReporter(bundle, argv = {}) {
  const directory = new Directory(global.currentDirectory || argv.path || argv.p || process.cwd());
  const configs = directory.getConfigs();
  const input = path.resolve(process.cwd(), bundle.bundle);
  const config = configs.find(currentConfig => path.resolve(currentConfig.context, currentConfig.output).endsWith(bundle.bundle));
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
    const name = buildExtensionName(input, config.context); // eslint-disable-next-line

    Logger.log(` ${logSymbols.success} Build extension ${name} ${testResult}`);
    return;
  }

  if (isComponentPath(input)) {
    const name = buildComponentName(input); // eslint-disable-next-line

    Logger.log(` ${logSymbols.success} Build component ${name} ${testResult}`);
    return;
  }

  if (isTemplatePath(input)) {
    const name = buildTemplateName(input); // eslint-disable-next-line

    Logger.log(` ${logSymbols.success} Build template ${name} ${testResult}`);
    return;
  } // eslint-disable-next-line


  Logger.log(` ${logSymbols.success} Build bundle ${bundle.bundle} ${testResult}`);
}

function invalidateModuleCache(module, recursive, store = []) {
  if (typeof module === 'string') {
    const resolvedModule = require.resolve(module);

    if (require.cache[resolvedModule] && !store.includes(resolvedModule)) {
      store.push(resolvedModule);

      if (Array.isArray(require.cache[resolvedModule].children) && recursive) {
        require.cache[resolvedModule].children.forEach(currentModule => {
          invalidateModuleCache(currentModule.id, recursive, store);
        });
      }

      delete require.cache[resolvedModule];
    }
  }
}

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os.homedir(), '.bitrix.lock');

/*
	eslint
 	"no-restricted-syntax": "off",
 	"no-await-in-loop": "off"
*/

function reporterStub() {}

function appendBootstrap() {
  const bootstrapPath = path__default.resolve(appRoot, 'dist/test.bootstrap.js');
  invalidateModuleCache(bootstrapPath); // eslint-disable-next-line

  require(bootstrapPath);
}

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
      tests.forEach(testFile => {
        const recursive = true;
        invalidateModuleCache(testFile, recursive);
        mocha.addFile(testFile);
      });
      appendBootstrap();
      await new Promise(resolve$$1 => {
        mocha.run(failures => {
          result.push(failures ? 'failure' : 'passed');
        }).on('end', () => resolve$$1());
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
async function test(dir, report = true) {
  if (Array.isArray(dir)) {
    for (const item of dir) {
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
      } // eslint-disable-next-line


      Logger.log(`Test module ${item}`.bold, `${testResult}`);
    }
  } else if (typeof dir === 'string') {
    await testDirectory(dir, report);
  } else {
    throw new Error('dir not string or array');
  }
}

global.testsStatus = global.testsStatus || {};
function rollupMochaTestRunner() {
  return {
    name: 'test',

    async onwrite(bundle) {
      if (argv.test || argv.t) {
        const directory = new Directory(global.currentDirectory);
        const configs = directory.getConfigs();
        const config = configs.find(({
          context,
          output
        }) => path__default.resolve(context, output).endsWith(bundle.file));
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
  output,
  plugins = {}
}) {
  return {
    input: {
      input: input.input,
      external: ['BX', 'react', 'react-dom'],
      treeshake: input.treeshake !== false,
      plugins: [resolve(), json(), postcss({
        extract: true,
        sourceMap: false,
        plugins: [autoprefixer({
          browsers: ['ie >= 11', 'last 4 version']
        })]
      }), plugins.babel !== false ? babel(plugins.babel || {
        sourceMaps: true,
        presets: [resolvePackageModule('@babel/preset-env')],
        plugins: [resolvePackageModule('@babel/plugin-external-helpers'), resolvePackageModule('@babel/plugin-transform-flow-strip-types'), resolvePackageModule('@babel/plugin-proposal-class-properties'), resolvePackageModule('@babel/plugin-proposal-private-methods')]
      }) : {}, commonjs({
        sourceMap: false
      }), rollupMochaTestRunner(), reporter({
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
        BX: 'BX',
        react: 'React',
        'react-dom': 'ReactDOM',
        window: 'window',
        ...output.globals
      }
    }
  };
}

module.exports = rollupConfig;
