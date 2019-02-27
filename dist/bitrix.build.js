'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Ora = _interopDefault(require('ora'));
var rollup = require('rollup');
var os = _interopDefault(require('os'));
var mustache = _interopDefault(require('mustache'));
var Concat = _interopDefault(require('concat-with-sourcemaps'));
require('colors');
var minimist = _interopDefault(require('minimist'));
var glob = _interopDefault(require('fast-glob'));
var EventEmitter = _interopDefault(require('events'));
var chokidar = _interopDefault(require('chokidar'));
var fs = require('fs');
var fs__default = _interopDefault(fs);
var slash = _interopDefault(require('slash'));
var path = require('path');
var path__default = _interopDefault(path);

function isModulePath(filePath) {
  const exp = new RegExp('/(.[a-z0-9-_]+)/install/js/(.[a-z0-9-_]+)/');
  const res = `${slash(filePath)}`.match(exp);
  return !!res && !!res[1] && !!res[2];
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
    }
  });
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
      const fileContent = fs.readFileSync(filePath, encoding);
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
    const {
      input,
      output
    } = buildRollupConfig(config); // @todo Remove global state change

    global.outputOptions = output; // Build

    const bundle = await rollup.rollup(input);
    await bundle.write({ ...output,
      ...{
        globals: getGlobals(bundle.imports, config)
      }
    });
    await concat(config.concat.js, config.output);
    await concat(config.concat.css, config.output); // Generate config.php if needed

    const bundleConfigPath = path.resolve(config.context, 'bundle.config.js');
    const configPhpPath = path.resolve(config.context, 'config.php');

    if (config.adjustConfigPhp && (isModulePath(input.input) || fs.existsSync(bundleConfigPath))) {
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
}

async function build(dir, recursive) {
  if (Array.isArray(dir)) {
    for (const item of dir) {
      // eslint-disable-next-line
      console.log(`Build module ${path.basename(item)}`.bold);
      await buildDirectory(item, recursive);
    }
  } else if (typeof dir === 'string') {
    await buildDirectory(dir, recursive);
  } else {
    throw new Error('dir not string or array');
  }
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
