'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = _interopDefault(require('os'));
var path = require('path');
var boxen = _interopDefault(require('boxen'));
require('colors');

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os.homedir(), '.bitrix.lock');

function info() {
  const location = {
    root: appRoot,
    flow: path.resolve(appRoot, 'node_modules', 'flow-bin'),
    eslint: path.resolve(appRoot, 'node_modules', 'eslint'),
    eslintrc: path.resolve(appRoot, '.eslintrc.js'),
    mercurial: {
      preupdate: path.resolve(appRoot, 'src', 'mercurial', 'hooks', 'preupdate.sh'),
      update: path.resolve(appRoot, 'src', 'mercurial', 'hooks', 'update.sh')
    }
  };
  return {
    location
  };
}

const options = {
  padding: 1,
  margin: 1,
  align: 'left',
  borderColor: 'yellow',
  borderStyle: 'round'
};
function box(content) {
  return boxen(content.replace(/^\s+|\s+$|\t/g, ''), options);
}

const pkg = require('../package.json');

function bitrixInfo() {
  const {
    location
  } = info();
  const result = box(`
		Info ${pkg.name}, v${pkg.version}
		
		${'Flow'.bold}
		Package: ${location.flow}
		
		${'ESLint'.bold}
		Package: ${location.eslint}
		Config: ${location.eslintrc}
		
		${'Mercurial'.bold}
		hooks.preupdate: ${location.mercurial.preupdate}
		hooks.update: ${location.mercurial.update}
		
		Update: npm update -g ${pkg.name}
		Remove: npm uninstall -g ${pkg.name}
	`);
  console.log(result);
}

module.exports = bitrixInfo;
