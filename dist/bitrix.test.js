'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Mocha = _interopDefault(require('mocha'));
var minimist = _interopDefault(require('minimist'));
var os = _interopDefault(require('os'));
var glob = _interopDefault(require('fast-glob'));
var Ora = _interopDefault(require('ora'));
var EventEmitter = _interopDefault(require('events'));
var chokidar = _interopDefault(require('chokidar'));
var fs = _interopDefault(require('fs'));
var slash = _interopDefault(require('slash'));
var path = require('path');
var path__default = _interopDefault(path);
require('colors');

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

function getDirectories(dir) {
  const pattern = slash(path__default.resolve(dir, '**'));
  const options = {
    onlyDirectories: true,
    deep: 0
  };
  return glob.sync(pattern, options).map(dirPath => path__default.basename(dirPath));
}

function isRepositoryRoot(dirPath) {
  let dirs = getDirectories(dirPath);
  return dirs.includes('main') && dirs.includes('fileman') && dirs.includes('iblock') && dirs.includes('ui') && dirs.includes('translate');
}

var params = {
  get path() {
    return path.resolve(argv.path || process.cwd());
  },

  get modules() {
    let modules = (argv.modules || '').split(',').map(module => module.trim()).filter(module => !!module).map(module => path.resolve(this.path, module));

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

    if (!fs.existsSync(path$$1)) {
      fs.writeFileSync(path$$1, '');
    }
  }

  isLocked(filePath) {
    return fs.readFileSync(this.path, 'utf-8').split('\n').some(repoPath => !!repoPath && filePath.startsWith(repoPath));
  }

}

var repository = new Repository(lockFile);

function isAllowed(fileName) {
  if (typeof fileName !== 'string') {
    return false;
  }

  fileName = slash(fileName);

  if (new RegExp('\/components\/(.*)\/style.js').test(fileName) || new RegExp('\/components\/(.*)\/style.css').test(fileName)) {
    return false;
  }

  let ext = path__default.extname(fileName);

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

function watch(directories) {
  directories = Array.isArray(directories) ? directories : [directories];
  const pattern = createPattern(directories);
  const emitter = new EventEmitter();
  process.nextTick(() => {
    emitter.emit('start', watcher);
  });
  const watcher = chokidar.watch(pattern).on('ready', () => emitter.emit('ready', watcher)).on('change', file => {
    if (repository.isLocked(file)) {
      return;
    }

    if (!isAllowedChanges(directories, file)) {
      return;
    }

    let changedConfig = directories.reduce((acc, dir) => acc.concat(new Directory(dir).getConfigs()), []).filter(config => path__default.resolve(file).includes(config.context)).reduce((prevConfig, config) => {
      if (prevConfig && prevConfig.context.length > config.context.length) {
        return prevConfig;
      }

      return config;
    }, null);

    if (changedConfig) {
      emitter.emit('change', changedConfig);
    }
  });
  return emitter;
}

function isAllowedChanges(directories, file) {
  return directories.every(dir => isAllowed(file) && isInput(dir, file));
}

function createPattern(directories) {
  return directories.reduce((acc, dir) => {
    let directory = new Directory(dir);
    let directoryConfigs = directory.getConfigs();
    directoryConfigs.forEach(currentConfig => {
      acc.push(slash(path__default.resolve(currentConfig.context, '**/*.js')));
      acc.push(slash(path__default.resolve(currentConfig.context, '**/*.css')));
      acc.push(slash(path__default.resolve(currentConfig.context, '**/*.scss')));
    });
    return acc;
  }, []);
}

async function bitrixTest({
  path: path$$1,
  modules = []
} = params) {
  await test(modules.length ? modules : path$$1);

  if (argv.watch) {
    return await new Promise(resolve => {
      const progressbar = new Ora();
      const directories = modules.length ? modules : [path$$1];
      const emitter = watch(directories).on('start', watcher => {
        progressbar.start('Run test watcher');
        resolve({
          watcher,
          emitter
        });
      }).on('ready', () => {
        progressbar.succeed(`Test watcher is ready`.green.bold);
      }).on('change', config => {
        void test(config.context);
      });
    });
  }
}

module.exports = bitrixTest;
