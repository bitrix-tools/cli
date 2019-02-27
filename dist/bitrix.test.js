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
  return files;
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
      acc.push({
        input: path.resolve(context, currentConfig.input),
        output: path.resolve(context, currentConfig.output),
        name: currentConfig.namespace || '',
        treeshake: currentConfig.treeshake !== false,
        adjustConfigPhp: currentConfig.adjustConfigPhp !== false,
        protected: currentConfig.protected === true,
        rel: makeIterable(currentConfig.rel),
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


      console.log(`Test module ${item}`.bold, `${testResult}`);
    }
  } else if (typeof dir === 'string') {
    await testDirectory(dir, report);
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
