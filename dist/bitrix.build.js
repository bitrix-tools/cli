'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Ora = _interopDefault(require('ora'));
var Concat = _interopDefault(require('concat-with-sourcemaps'));
var logSymbols = _interopDefault(require('log-symbols'));
var filesize = _interopDefault(require('filesize'));
var Mocha = _interopDefault(require('mocha'));
var Logger = _interopDefault(require('@bitrix/logger'));
var minimist = _interopDefault(require('minimist'));
var os = _interopDefault(require('os'));
require('colors');
var rollup = require('rollup');
var mustache = _interopDefault(require('mustache'));
var detectCharacterEncoding = _interopDefault(require('detect-character-encoding'));
var iconv = require('iconv-lite');
var glob = _interopDefault(require('fast-glob'));
var EventEmitter = _interopDefault(require('events'));
var chokidar = _interopDefault(require('chokidar'));
var fs = require('fs');
var fs__default = _interopDefault(fs);
var slash = _interopDefault(require('slash'));
var path = require('path');
var path__default = _interopDefault(path);

function isEs6File(path$$1) {
  return typeof path$$1 === 'string' && path$$1.endsWith('script.es6.js');
}

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
  const options = {
    dot: true,
    cache: true,
    unique: false
  };
  return glob.sync(pattern, options).reduce((acc, file) => {
    const context = path.dirname(file);
    const config = getConfigByFile(file);
    const configs = makeIterable(config);
    configs.forEach(currentConfig => {
      let {
        plugins
      } = currentConfig;

      if (typeof plugins !== 'object') {
        plugins = {
          resolve: false
        };
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

function adjustSourceMap(mapPath) {
  if (typeof mapPath === 'string') {
    if (fs__default.existsSync(mapPath)) {
      const file = fs__default.readFileSync(mapPath, 'utf-8');
      const map = JSON.parse(file);
      map.sources = map.sources.map(sourcePath => {
        return slash(path.relative(slash(path.dirname(mapPath)), slash(sourcePath)));
      });

      if (map.file) {
        map.file = path.basename(mapPath);
      }

      fs__default.writeFileSync(mapPath, JSON.stringify(map));
    }
  }
}

const separator = '\n\n';
const generateSourceMap = true;
const encoding = 'utf-8';
function concat(input = [], output) {
  if (Array.isArray(input) && input.length) {
    const concatenator = new Concat(generateSourceMap, output, separator);
    input.filter(fs.existsSync).forEach(filePath => {
      const fileContent = fs.readFileSync(filePath);
      const sourceMapPath = `${filePath}.map`;
      let sourceMapContent;

      if (fs.existsSync(sourceMapPath)) {
        const mapContent = JSON.parse(fs.readFileSync(sourceMapPath, encoding));
        mapContent.sources = mapContent.sources.map(sourcePath => path.resolve(path.dirname(sourceMapPath), sourcePath));
        sourceMapContent = JSON.stringify(mapContent);
      }

      concatenator.add(filePath, fileContent, sourceMapContent);
    });
    const {
      content,
      sourceMap
    } = concatenator;
    fs.writeFileSync(output, content);
    fs.writeFileSync(`${output}.map`, sourceMap);
    adjustSourceMap(`${output}.map`);
  }
}

function isModulePath(filePath) {
  const moduleExp = new RegExp('/(.[a-z0-9-_]+)/install/js/(.[a-z0-9-_]+)/');
  const moduleRes = `${slash(filePath)}`.match(moduleExp);

  if (!!moduleRes && !!moduleRes[1] && !!moduleRes[2]) {
    return true;
  }

  const localExp = new RegExp('/local/js/(.[a-z0-9-_]+)/(.[a-z0-9-_]+)/');
  const localRes = `${slash(filePath)}`.match(localExp);
  return !!localRes && !!localRes[1] && !!localRes[2];
}

function buildExtensionName(filePath, context) {
  const moduleExp = new RegExp('/(.[a-z0-9_-]+)/install/js/(.[a-z0-9_-]+)/');
  const moduleRes = `${slash(filePath)}`.match(moduleExp);

  if (Array.isArray(moduleRes)) {
    const fragments = `${slash(context)}`.split(`${moduleRes[1]}/install/js/${moduleRes[2]}/`);
    return `${moduleRes[2]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
  }

  const localExp = new RegExp('/local/js/(.[a-z0-9_-]+)/(.[a-z0-9_-]+)/');
  const localRes = `${slash(filePath)}`.match(localExp);

  if (!Array.isArray(localRes)) {
    return path.basename(context);
  }

  const fragments = `${slash(context)}`.split(`/local/js/${localRes[1]}/`);
  return `${localRes[1]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
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

function printRow(row) {
  const nameCell = ` ${row.infoSymbol} Build ${row.type} ${row.name}`;
  const testCell = `${row.testStatus || ''}`;
  const sizeCell = `${row.jsSize ? `js: ${row.jsSize}` : ''}${row.cssSize ? `, css: ${row.cssSize}` : ''}`.grey;
  Logger.log(`${nameCell} ${testCell} ${sizeCell}`);
}

function printError(error) {
  if (error) {
    if (error.code === 'UNRESOLVED_IMPORT') {
      Logger.log(`    Error: ${error.message}`.red);
      return;
    }

    if (error.code === 'PLUGIN_ERROR') {
      Logger.log(`    Error: ${error.message.replace('undefined:', '')}`.red);
      return;
    }

    throw new Error(error);
  }
}

function report({
  config,
  testResult,
  error
}) {
  const reportData = {
    testStatus: '',
    jsSize: '',
    cssSize: '',
    summarySize: '',
    infoSymbol: ''
  };

  if (testResult === 'passed') {
    reportData.testStatus = 'tests passed'.green;
  }

  if (testResult === 'failure') {
    reportData.testStatus = 'tests failed'.red;
  }

  if (testResult === 'notests') {
    reportData.testStatus = 'no tests'.grey;
  }

  const jsBundle = config.output;

  if (fs.existsSync(jsBundle)) {
    const stat = fs.statSync(jsBundle);
    reportData.jsSize = filesize(stat.size, {
      round: 0
    });
    reportData.summarySize = stat.size;
  }

  const cssBundle = config.output.replace('.js', '.css');

  if (fs.existsSync(cssBundle)) {
    const stat = fs.statSync(cssBundle);
    reportData.cssSize = filesize(stat.size, {
      round: 0
    });
    reportData.summarySize += stat.size;
  }

  reportData.summarySize = filesize(reportData.summarySize, {
    round: 0
  });

  if (error) {
    reportData.infoSymbol = logSymbols.error;
  } else {
    reportData.infoSymbol = logSymbols.success;
  }

  if (isModulePath(config.input)) {
    const name = buildExtensionName(config.input, config.context);
    printRow({ ...reportData,
      type: 'extension',
      name
    });
    printError(error);
    return;
  }

  if (isComponentPath(config.input)) {
    const name = buildComponentName(config.input);
    printRow({ ...reportData,
      type: 'component',
      name
    });
    printError(error);
    return;
  }

  if (isTemplatePath(config.input)) {
    const name = buildTemplateName(config.input);
    printRow({ ...reportData,
      type: 'template',
      name
    });
    printError(error);
    return;
  }

  printRow({ ...reportData,
    type: 'bundle',
    name: config.output
  });
  printError(error);
}

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
    return testDirectory(dir, report);
  } else {
    throw new Error('dir not string or array');
  }

  return '';
}

function getGlobals(imports, {
  context
}) {
  return imports.reduce((accumulator, extensionName) => {
    const parsedExtensionName = extensionName.split('.');
    const moduleName = parsedExtensionName.shift();
    const moduleRoot = path.join(context.split('modules')[0], 'modules', moduleName);
    const moduleJsRoot = path.join(moduleRoot, 'install', 'js', moduleName);
    const extensionPath = path.join(moduleJsRoot, path.join(...parsedExtensionName));
    const configPath = path.join(extensionPath, 'bundle.config.js');
    let moduleAlias = 'BX';

    if (fs.existsSync(configPath)) {
      moduleAlias = 'window'; // eslint-disable-next-line

      const config = require(configPath);

      if (config.namespace && config.namespace.length) {
        moduleAlias = config.namespace;
      }
    }

    accumulator[extensionName] = moduleAlias;
    return accumulator;
  }, {});
}

function buildRollupConfig(config) {
  invalidateModuleCache(path.resolve(appRoot, 'dist/rollup.config.js')); // eslint-disable-next-line

  const rollupConfig = require(path.resolve(appRoot, 'dist/rollup.config.js'));

  return rollupConfig({
    input: {
      input: path.resolve(config.context, config.input),
      treeshake: config.treeshake !== false
    },
    output: {
      file: path.resolve(config.context, config.output),
      name: config.name
    },
    plugins: config.plugins
  });
}

async function rollupBundle(config) {
  const {
    input,
    output
  } = buildRollupConfig(config);
  const bundle = await rollup.rollup(input);
  const globals = getGlobals(bundle.imports, config);
  await bundle.write({ ...output,
    globals
  });
  return bundle;
}

function buildConfigBundlePath(filePath, ext) {
  const normalizedPath = `${slash(filePath)}`;

  if (ext === 'js') {
    return normalizedPath.replace('.css', '.js');
  }

  if (ext === 'css') {
    return normalizedPath.replace('.js', '.css');
  }

  return normalizedPath;
}

function renderRel(rel) {
  // @todo refactor this
  return `${rel.map((item, i) => `${!i ? '\n' : ''}\t\t'${item}'`).join(',\n')}${rel.length ? ',\n\t' : ''}`;
}

function generateConfigPhp(config) {
  if (!!config && typeof config !== 'object') {
    throw new Error('Invalid config');
  }

  const templatePath = path__default.resolve(appRoot, 'src/templates/config.php');
  const template = fs__default.readFileSync(templatePath, 'utf-8');
  const outputPath = path__default.resolve(slash(config.context), slash(config.output));
  const data = {
    cssPath: slash(path__default.relative(slash(config.context), buildConfigBundlePath(outputPath, 'css'))),
    jsPath: slash(path__default.relative(slash(config.context), buildConfigBundlePath(outputPath, 'js'))),
    rel: renderRel(config.rel)
  };
  return mustache.render(template, data);
}

async function adjustExtension(bundle, config) {
  const bundleConfigPath = path.resolve(config.context, 'bundle.config.js');
  const configPhpPath = path.resolve(config.context, 'config.php');

  if (config.adjustConfigPhp && (isModulePath(config.input) || fs.existsSync(bundleConfigPath))) {
    if (!fs.existsSync(configPhpPath)) {
      fs.writeFileSync(configPhpPath, generateConfigPhp(config));
    }

    const extNameExp = /^(\w).(.[\w.])/;
    let imports = [...bundle.imports].filter(item => extNameExp.test(item));

    if (!imports.includes('main.core') && !imports.includes('main.polyfill.core')) {
      imports = ['main.polyfill.core', ...imports];
    } // Updates dependencies list


    const relExp = /['"]rel['"] => (\[.*?\])(,?)/s;
    let configContent = fs.readFileSync(configPhpPath, 'utf-8');
    const result = configContent.match(relExp);

    if (Array.isArray(result) && result[1]) {
      const relativities = `[${renderRel(imports)}]`;
      configContent = configContent.replace(result[1], relativities); // Adjust skip_core

      const skipCoreExp = /['"]skip_core['"] => (true|false)(,?)/;
      const skipCoreResult = configContent.match(skipCoreExp);
      const skipCoreValue = !imports.includes('main.core');

      if (Array.isArray(skipCoreResult) && skipCoreResult[1]) {
        configContent = configContent.replace(skipCoreExp, `'skip_core' => ${skipCoreValue},`);
      } else {
        configContent = configContent.replace(relExp, `'rel' => ${relativities},\n\t'skip_core' => ${skipCoreValue},`);
      }

      fs.writeFileSync(configPhpPath, configContent);
    }
  }
}

function getEncoding(buffer) {
  const result = detectCharacterEncoding(buffer);

  if (!result || result.encoding === 'UTF-8') {
    return 'utf-8';
  }

  return 'windows-1251';
}
function adjustEncoding(config) {
  const input = fs.readFileSync(config.input);
  const inputFileEncoding = getEncoding(input);
  const output = fs.readFileSync(config.output);
  const outputFileEncoding = getEncoding(output);
  const sourceContent = iconv.decode(output, outputFileEncoding);
  const content = iconv.encode(sourceContent, inputFileEncoding);
  fs.writeFileSync(config.output, content);
}

/*
	eslint
 	"no-restricted-syntax": "off",
 	"no-await-in-loop": "off"
*/

async function buildDirectory(dir, recursive = true) {
  const directory = new Directory(dir);
  const configs = directory.getConfigs(recursive); // @todo Remove global state change

  global.currentDirectory = path.resolve(dir);

  for (const config of configs) {
    let testResult;

    try {
      const bundle = await rollupBundle(config);
      await concat(config.concat.js, config.output);
      await concat(config.concat.css, config.output);
      await adjustExtension(bundle, config);
      await adjustEncoding(config);

      if (argv.test || argv.t) {
        testResult = await test(config.context);
      }
    } catch (error) {
      report({
        config,
        error
      });
      return;
    }

    report({
      config,
      testResult
    });
  }
}

async function build(dir, recursive) {
  if (Array.isArray(dir)) {
    for (const item of dir) {
      Logger.log(`Build module ${path.basename(item)}`.bold);
      await buildDirectory(item, recursive);
    }
  } else if (typeof dir === 'string') {
    await buildDirectory(dir, recursive);
  } else {
    throw new Error('dir not string or array');
  }
}

function getDirectories(dir) {
  const pattern = slash(path__default.resolve(dir, '**'));
  const options = {
    onlyDirectories: true,
    deep: 0
  };
  return glob.sync(pattern, options).map(dirPath => path__default.basename(dirPath));
}

function isRepositoryRoot(dirPath) {
  const dirs = getDirectories(dirPath);
  return dirs.includes('main') && dirs.includes('fileman') && dirs.includes('iblock') && dirs.includes('ui') && dirs.includes('translate');
}

var params = {
  get path() {
    return path.resolve(argv.path || process.cwd());
  },

  get modules() {
    const modules = (argv.modules || '').split(',').map(module => module.trim()).filter(module => !!module).map(module => path.resolve(this.path, module));

    if (isRepositoryRoot(this.path) && modules.length === 0) {
      return getDirectories(this.path);
    }

    return modules;
  },

  get name() {
    return argv.name || argv._[1];
  }

};

class Repository {
  constructor(path$$1) {
    this.path = path$$1;

    if (!fs__default.existsSync(path$$1)) {
      fs__default.writeFileSync(path$$1, '');
    }
  }

  isLocked(filePath) {
    return fs__default.readFileSync(this.path, 'utf-8').split('\n').some(repoPath => !!repoPath && filePath.startsWith(repoPath));
  }

}

var repository = new Repository(lockFile);

function isAllowed(fileName) {
  if (typeof fileName !== 'string') {
    return false;
  }

  const normalizedFileName = slash(fileName);

  if (new RegExp('/components/(.*)/style.js').test(normalizedFileName) || new RegExp('/components/(.*)/style.css').test(normalizedFileName)) {
    return false;
  }

  const ext = path__default.extname(normalizedFileName);

  switch (ext) {
    case '.js':
    case '.jsx':
    case '.css':
    case '.scss':
      return true;

    default:
      return false;
  }
}

function isInput(dir, fileName) {
  return new Directory(dir).getConfigs().every(config => {
    return !fileName.includes(path__default.normalize(config.output)) && !fileName.includes(path__default.normalize(config.output.replace('.js', '.css')));
  });
}

function isAllowedChanges(directories, file) {
  return directories.every(dir => isAllowed(file) && isInput(dir, file));
}

function createPattern(directories) {
  return directories.reduce((acc, dir) => {
    const directory = new Directory(dir);
    const directoryConfigs = directory.getConfigs();
    directoryConfigs.forEach(currentConfig => {
      acc.push(slash(path__default.resolve(currentConfig.context, '**/*.js')));
      acc.push(slash(path__default.resolve(currentConfig.context, '**/*.css')));
      acc.push(slash(path__default.resolve(currentConfig.context, '**/*.scss')));
    });
    return acc;
  }, []);
}

function watch(directories) {
  const preparedDirectories = Array.isArray(directories) ? directories : [directories];
  const pattern = createPattern(preparedDirectories);
  const emitter = new EventEmitter();
  const watcher = chokidar.watch(pattern).on('ready', () => emitter.emit('ready', watcher)).on('change', file => {
    if (repository.isLocked(file)) {
      return;
    }

    if (!isAllowedChanges(preparedDirectories, file)) {
      return;
    }

    const changedConfig = preparedDirectories.reduce((acc, dir) => acc.concat(new Directory(dir).getConfigs()), []).filter(config => path__default.resolve(file).includes(config.context)).reduce((prevConfig, config) => {
      if (prevConfig && prevConfig.context.length > config.context.length) {
        return prevConfig;
      }

      return config;
    }, null);

    if (changedConfig) {
      emitter.emit('change', changedConfig);
    }
  });
  process.nextTick(() => {
    emitter.emit('start', watcher);
  });
  return emitter;
}

/*
	eslint
 	"no-restricted-syntax": "off",
 	"no-await-in-loop": "off"
*/

async function bitrixBuild({
  path: path$$1,
  modules = []
} = params) {
  await build(modules.length ? modules : path$$1);

  if (argv.watch) {
    return new Promise(resolve => {
      const progressbar = new Ora();
      const directories = modules.length ? modules : [path$$1];
      const emitter = watch(directories).on('start', watcher => {
        progressbar.start('Run watcher');
        resolve({
          watcher,
          emitter
        });
      }).on('ready', () => {
        progressbar.succeed('Watcher is ready'.green.bold);
      }).on('change', config => {
        void build(config.context, false);
      });
    });
  }

  return Promise.resolve();
}

module.exports = bitrixBuild;
