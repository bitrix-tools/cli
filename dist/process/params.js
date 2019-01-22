'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var minimist = _interopDefault(require('minimist'));
var slash = _interopDefault(require('slash'));
var glob = _interopDefault(require('fast-glob'));
var nodePath = require('path');
var nodePath__default = _interopDefault(nodePath);

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
  const pattern = slash(nodePath__default.resolve(dir, '**'));
  const options = {
    onlyDirectories: true,
    deep: 0
  };
  return glob.sync(pattern, options).map(dirPath => nodePath__default.basename(dirPath));
}

function isRepositoryRoot(dirPath) {
  let dirs = getDirectories(dirPath);
  return dirs.includes('main') && dirs.includes('fileman') && dirs.includes('iblock') && dirs.includes('ui') && dirs.includes('translate');
}

var params = {
  get path() {
    return nodePath.resolve(argv.path || process.cwd());
  },

  get modules() {
    let modules = (argv.modules || '').split(',').map(module => module.trim()).filter(module => !!module).map(module => nodePath.resolve(this.path, module));

    if (isRepositoryRoot(this.path) && modules.length === 0) {
      return getDirectories(this.path);
    }

    return modules;
  },

  get name() {
    return argv.name || argv._[1];
  }

};

module.exports = params;
