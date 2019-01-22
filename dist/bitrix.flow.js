'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = _interopDefault(require('os'));
var fs = require('fs');
var minimist = _interopDefault(require('minimist'));
var slash = _interopDefault(require('slash'));
var glob = require('fast-glob');
var glob__default = _interopDefault(glob);
var path = require('path');
var path__default = _interopDefault(path);

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os.homedir(), '.bitrix.lock');

const type = process.platform.includes('win') ? 'junction' : null;
function createSymlink(src, dest) {
  src = path.resolve(src);
  dest = path.resolve(dest);

  if (fs.existsSync(src)) {
    if (fs.lstatSync(src).isDirectory()) {
      const destDirPath = path.resolve(dest, `../${path.basename(src)}`);

      if (!fs.existsSync(destDirPath)) {
        fs.mkdirSync(destDirPath);
      }

      const children = glob.sync(path.join(src, '**'));
      children.forEach(child => {
        if (typeof child === 'string') {
          const destPath = path.resolve(dest, path.basename(child));
          createSymlink(child, destPath);
        }
      });
    } else {
      fs.symlinkSync(src, dest, type);
    }
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
  return glob__default.sync(pattern, options).map(dirPath => path__default.basename(dirPath));
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

const srcConfigPath = path.resolve(appRoot, 'src/templates/.flowconfig');
const srcFlowTypedPath = path.resolve(appRoot, 'src/templates/flow-typed');
function bitrixFlow({
  path: path$$1
} = params, {
  init
} = argv) {
  if (init) {
    const currentDir = path$$1;

    if (typeof currentDir !== 'string') {
      throw new Error('path or p not string');
    }

    const distFlowTypedPath = path.resolve(currentDir, 'flow-typed');
    const distConfigPath = path.resolve(currentDir, '.flowconfig');
    createSymlink(srcFlowTypedPath, distFlowTypedPath);
    createSymlink(srcConfigPath, distConfigPath);
  }
}

module.exports = bitrixFlow;
