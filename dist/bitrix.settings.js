'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var inquirer = _interopDefault(require('inquirer'));
var boxen = _interopDefault(require('boxen'));
var ini = _interopDefault(require('ini'));
var minimist = _interopDefault(require('minimist'));
require('colors');
var path = require('path');
var os = require('os');
var os__default = _interopDefault(os);
var fs = require('fs');
var logSymbols = _interopDefault(require('log-symbols'));

async function ask(questions = []) {
  const answers = {};

  if (!Array.isArray(questions) || !questions.length) {
    return answers;
  }

  const rawAnswers = await inquirer.prompt(questions);
  return Object.keys(rawAnswers).reduce((acc, item) => {
    const question = questions.find(currentQuestion => {
      return currentQuestion.name === item;
    });
    answers[question.id || item] = rawAnswers[item];
    return answers;
  }, answers);
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

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os__default.homedir(), '.bitrix.lock');

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

  let hgrc = ini.parse(fs.readFileSync(params.path, 'utf-8'));

  if (!('hooks' in hgrc)) {
    hgrc.hooks = {};
  }

  hgrc.hooks['preupdate.bitrix.build.watcher'] = preUpdateHandler;
  hgrc.hooks['update.bitrix.build.watcher'] = updateHandler;
  let encodedHgrc = ini.encode(hgrc);
  fs.writeFileSync(params.path, encodedHgrc);

  if (!argv.silent && params.silent !== true) {
    console.log(`${params.path} updated`.green.bold);
  }
}

async function bitrixSettings() {
  if (argv.intro) {
    console.log(box(`
			${logSymbols.success} @bitrix/cli installed 
			Answer a few questions
		`));
  }

  const answers = await ask([{
    name: 'Adjust Mercurial repository',
    id: 'hg',
    type: 'confirm',
    default: false
  }]);

  if (answers.hg) {
    const adjustAnswers = await ask([{
      name: 'Adjust all repositories',
      id: 'adjustType',
      type: 'list',
      choices: [{
        name: 'All repositories',
        value: 'all',
        default: true
      }, {
        name: 'Specified repository',
        value: 'specified'
      }]
    }]);

    if (adjustAnswers.adjustType === 'all') {
      const hgrcPath = path.resolve(os.homedir(), '.hgrc');
      bitrixAdjust({
        silent: true,
        path: hgrcPath
      });
      console.log(box(`${hgrcPath} updated`));
    }

    if (adjustAnswers.adjustType === 'specified') {
      const repositoryAnswers = await ask([{
        name: 'Specify repository path',
        id: 'path',
        type: 'input',
        validate: value => {
          const normalizedValue = value ? value.replace('~', os.homedir()) : '';
          const repositoryPath = path.resolve(normalizedValue);

          if (!fs.existsSync(repositoryPath)) {
            return `Not exists path ${repositoryPath}`;
          }

          const hgPath = path.resolve(repositoryPath, '.hg');

          if (!fs.existsSync(hgPath)) {
            return `Specified path is not valid Mercurial repository`;
          }

          return true;
        }
      }]);
      const normalizedPath = repositoryAnswers.path.replace('~', os.homedir());
      const repositoryPath = path.resolve(normalizedPath);
      const hgrcPath = path.resolve(repositoryPath, '.hg', '.hgrc');
      bitrixAdjust({
        silent: true,
        path: hgrcPath
      });
      console.log(box(`${hgrcPath} updated`));
    }
  }
}

module.exports = bitrixSettings;
