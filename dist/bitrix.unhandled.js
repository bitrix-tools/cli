'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var minimist = _interopDefault(require('minimist'));
var colors = _interopDefault(require('colors'));
var Logger = _interopDefault(require('@bitrix/logger'));

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

function space(count) {
  return ' '.repeat(count);
}

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
    let preparedDescription = description;

    if (preparedDescription.includes('\n')) {
      preparedDescription = description.split('\n').reduce((acc, item, index) => {
        if (index) {
          return `${acc}\n${space(20 + this.offset + 2)}${item}`;
        }

        return `${acc}${item}`;
      }, '');
    }

    this.data.push(`${space(this.offset + 2)}${command}${space(20 - command.length)}${preparedDescription}`);
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
      // eslint-disable-next-line
      Logger.log(`${item}`);
    });
  }

}

const helper = new Help();
helper.usage('bitrix <command> [options]').header('Bundler commands').command('build', 'Builds all bundles from current directory').subheader('Options').option('-w, --watch', 'Run file change watcher for current directory').option('-m, --modules', 'Run command for specified modules').option('-p, --path', 'Run command for path').option('-t, --test', 'Run tests after build').separator().header('Create extension').command('create [extName]', 'Runs create extension wizard').separator().header('Testing').command('test', 'Runs file change watcher for current directory').subheader('Options').option('-w, --watch', 'Run file change watcher for current directory').option('-m, --modules', 'Run command for specified modules').option('-p, --path', 'Run command for path').separator().header('Settings').command('settings', 'Runs settings wizard').separator().header('Info').command('info', 'Prints information about tools').separator().header('Help').command('--help, -h', 'Prints help information').separator();
function help() {
  helper.print();
}

var name = "@bitrix/cli";
var version = "2.1.13";

function bitrixUnhandledCommand(params = argv) {
  if (params.help) {
    help();
    return;
  }

  if (params.version) {
    Logger.log(name, version);
    return;
  }

  Logger.log('Unknown command. Try run "bitrix --help" for more information');
}

module.exports = bitrixUnhandledCommand;
