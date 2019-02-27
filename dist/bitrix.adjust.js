'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var ini = _interopDefault(require('ini'));
var os = require('os');
var os__default = _interopDefault(os);
var path = require('path');
var minimist = _interopDefault(require('minimist'));
require('colors');

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os__default.homedir(), '.bitrix.lock');

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

const preUpdateHandler = path.resolve(appRoot, 'src/mercurial/hooks/preupdate.sh');
const updateHandler = path.resolve(appRoot, 'src/mercurial/hooks/update.sh');
const defaultPath = path.resolve(os.homedir(), '.hgrc');
const hgrcPath = argv.path || defaultPath;
function bitrixAdjust(params = {
  path: hgrcPath
}) {
  if (!params.path) {
    throw new Error('params.path is not string');
  }

  if (!fs.existsSync(params.path)) {
    if (!fs.existsSync(path.dirname(params.path))) {
      fs.mkdirSync(path.dirname(params.path), {
        recursive: true
      });
    }

    fs.writeFileSync(params.path, '');
  }

  if (!fs.existsSync(`${params.path}.backup`)) {
    fs.copyFileSync(params.path, `${params.path}.backup`);
  }

  const hgrc = ini.parse(fs.readFileSync(params.path, 'utf-8'));

  if (!('hooks' in hgrc)) {
    hgrc.hooks = {};
  }

  hgrc.hooks['preupdate.bitrix.build.watcher'] = preUpdateHandler;
  hgrc.hooks['update.bitrix.build.watcher'] = updateHandler;
  const encodedHgrc = ini.encode(hgrc);
  fs.writeFileSync(params.path, encodedHgrc);

  if (!argv.silent && params.silent !== true) {
    // eslint-disable-next-line
    console.log(`${params.path} updated`.green.bold);
  }
}

module.exports = bitrixAdjust;
