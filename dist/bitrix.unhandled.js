'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var minimist = _interopDefault(require('minimist'));
var colors = _interopDefault(require('colors'));

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

class Help {
  constructor() {
    this.data = [];
    this.offset = 5;
  }

  usage(text) {
    this.data.push(`${space(this.offset)}${'Usage:'.bold} ${text}\n`);
    return this;
  }

  header(text) {
    this.data.push(`${space(this.offset)}${text}`.bold);
    return this;
  }

  subheader(text) {
    this.data.push(`${space(this.offset + 2)}${text}`.bold);
    return this;
  }

  command(command, description) {
    if (description.includes('\n')) {
      description = description.split('\n').reduce((acc, item, index) => {
        if (index) {
          acc += `\n${space(20 + this.offset + 2)}${item}`;
        } else {
          acc += item;
        }

        return acc;
      }, '');
    }

    this.data.push(`${space(this.offset + 2)}${command}${space(20 - command.length)}${description}`);
    return this;
  }

  option(option, description) {
    this.data.push(`${space(this.offset + 4)}${option}${space(18 - option.length)}${description}`);
    return this;
  }

  separator() {
    this.data.push(`${space(this.offset)}${colors.gray('-'.repeat(60))}`);
    return this;
  }

  print() {
    ['\n', ...this.data, '\n'].forEach(item => {
      console.log(`${item}`);
    });
  }

}

function space(count) {
  return ' '.repeat(count);
}

const helper = new Help();
helper.usage('bitrix <command> [options]').header('Bundler commands').command('build', 'Builds all bundles from current directory').subheader('Options').option('-w, --watch', 'Run file change watcher for current directory').option('-m, --modules', 'Run command for specified modules').option('-p, --path', 'Run command for path').option('-t, --test', 'Run tests after build').separator().header('Create entities').command('create <options>', 'Create entity').subheader('Options').option('--extension', 'Starts the new extension wizard').option('--component', 'Starts the new component wizard').option('--module', 'Starts the new module wizard').separator().header('Technology usage').command('flow', 'Initializes Flow tech for current directory').command('typescript', '(soon) Initializes TypeScript tech for current directory').subheader('Options').option('-i, --init', 'Initialize technology for current directory').option('-p, --path', 'Initialize technology for specified directory').separator().header('Adjusts').command('adjust', 'Adds Mercurial events handlers for all repositories. ' + '\nThe command modifies file ~/.hgrc. Before modification, ' + '\na backup copy of the file with the name will be created .hgrc.backup').subheader('Options').option('--hg', 'Adjusts hg repositories').separator().header('Testing').command('test', 'Runs file change watcher for current directory').subheader('Options').option('-w, --watch', 'Run file change watcher for current directory').option('-m, --modules', 'Run command for specified modules').option('-p, --path', 'Run command for path');
function help() {
  helper.print();
}

function bitrixUnhandledCommand(params = argv) {
  if (params.help) {
    return help();
  }

  if (params.version) {
    const pkg = require('../package.json');

    return console.log(pkg.name, pkg.version);
  }

  console.log('Unknown command. Try run "bitrix --help" for more information');
}

module.exports = bitrixUnhandledCommand;
