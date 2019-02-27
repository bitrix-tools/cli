'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rollup = require('rollup');
var os = _interopDefault(require('os'));
var mustache = _interopDefault(require('mustache'));
var Concat = _interopDefault(require('concat-with-sourcemaps'));
require('colors');
var minimist = _interopDefault(require('minimist'));
var glob = _interopDefault(require('fast-glob'));
var Ora = _interopDefault(require('ora'));
var EventEmitter = _interopDefault(require('events'));
var chokidar = _interopDefault(require('chokidar'));
var fs = require('fs');
var fs__default = _interopDefault(fs);
var slash = _interopDefault(require('slash'));
var path = require('path');
var path__default = _interopDefault(path);

function isModulePath(filePath) {
  let exp = new RegExp('\/(.[a-z0-9-_]+)\/install\/js\/(.[a-z0-9-_]+)\/');
  let res = slash(filePath).match(exp);
  return !!res && !!res[1] && !!res[2];
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

function buildRollupConfig(config) {
  invalidateModuleCache(path.resolve(appRoot, 'dist/rollup.config.js'));

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
  filePath = slash(filePath);

  if (ext === 'js') {
    return filePath.replace('.css', '.js');
  }

  if (ext === 'css') {
    return filePath.replace('.js', '.css');
  }

  return filePath;
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

function getGlobals(imports, {
  context
}) {
  return imports.reduce((accumulator, extensionName) => {
    const parsedExtensionName = extensionName.split('.');
    const moduleName = parsedExtensionName.shift();
    const moduleRoot = path.join(context.split('modules')[0], 'modules', moduleName);
    const moduleJsRoot = path.join(moduleRoot, 'install', 'js', moduleName);
    const extensionPath = path.join(moduleJsRoot, path.join.apply(null, parsedExtensionName));
    const configPath = path.join(extensionPath, 'bundle.config.js');
    let moduleAlias = 'BX';

    if (fs.existsSync(configPath)) {
      moduleAlias = 'window';

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
      let fileContent = fs.readFileSync(filePath, encoding);
      let sourceMapContent = undefined;
      let sourceMapPath = `${filePath}.map`;

      if (fs.existsSync(sourceMapPath)) {
        let mapContent = JSON.parse(fs.readFileSync(sourceMapPath, encoding));
        mapContent.sources = mapContent.sources.map(sourcePath => {
          return path.resolve(path.dirname(sourceMapPath), sourcePath);
        });
        sourceMapContent = JSON.stringify(mapContent);
      }

      concatenator.add(filePath, fileContent, sourceMapContent);
    });
    let {
      content,
      sourceMap
    } = concatenator;
    fs.writeFileSync(output, content);
    fs.writeFileSync(`${output}.map`, sourceMap);
    adjustSourceMap(`${output}.map`);
  }
}

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

      let imports = [...bundle.imports];

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

async function bitrixBuild({
  path: path$$1,
  modules = []
} = params) {
  await build(modules.length ? modules : path$$1);

  if (argv.watch) {
    return await new Promise(resolve => {
      const progressbar = new Ora();
      const directories = modules.length ? modules : [path$$1];
      const emitter = watch(directories).on('start', watcher => {
        progressbar.start('Run watcher');
        resolve({
          watcher,
          emitter
        });
      }).on('ready', () => {
        progressbar.succeed(`Watcher is ready`.green.bold);
      }).on('change', config => {
        void build(config.context, false);
      });
    });
  }
}

module.exports = bitrixBuild;
