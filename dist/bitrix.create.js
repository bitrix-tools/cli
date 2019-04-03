'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var camelcase = _interopDefault(require('camelcase'));
var os = _interopDefault(require('os'));
var minimist = _interopDefault(require('minimist'));
var slash = _interopDefault(require('slash'));
var glob = require('fast-glob');
var glob__default = _interopDefault(glob);
var path = require('path');
var path__default = _interopDefault(path);
var fs = require('fs');
var mustache = require('mustache');
var fse = _interopDefault(require('fs-extra'));
var inquirer = _interopDefault(require('inquirer'));
var boxen = _interopDefault(require('boxen'));
require('colors');
var Logger = _interopDefault(require('@bitrix/logger'));

const appRoot = path.resolve(__dirname, '../');
const lockFile = path.resolve(os.homedir(), '.bitrix.lock');

function buildExtensionName(filePath, context) {
  const moduleExp = new RegExp('/(.[a-z0-9_-]+)/install/js/(.[a-z0-9_-]+)/');
  const moduleRes = `${slash(filePath)}`.match(moduleExp);

  if (Array.isArray(moduleRes)) {
    const fragments = `${slash(context)}`.split(`${moduleRes[1]}/install/js/${moduleRes[2]}/`);
    return `${moduleRes[2]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
  }

  const localExp = new RegExp('/local/js/(.[a-z0-9_-]+)/(.[a-z0-9_-]+)/');
  const localRes = `${slash(filePath)}`.match(localExp);

  if (!Array.isArray(localRes)) {
    return path.basename(context);
  }

  const fragments = `${slash(context)}`.split(`/local/js/${localRes[1]}/`);
  return `${localRes[1]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
}

const type = process.platform.includes('win') ? 'junction' : null;
function createSymlink(src, dest) {
  const resolvedSrc = path.resolve(src);
  const resolvedDest = path.resolve(dest);

  if (fs.existsSync(resolvedSrc)) {
    if (fs.lstatSync(resolvedSrc).isDirectory()) {
      const destDirPath = path.resolve(resolvedDest, `../${path.basename(resolvedSrc)}`);

      if (!fs.existsSync(destDirPath)) {
        fs.mkdirSync(destDirPath);
      }

      const children = glob.sync(path.join(resolvedSrc, '**'));
      children.forEach(child => {
        if (typeof child === 'string') {
          const destPath = path.resolve(resolvedDest, path.basename(child));
          createSymlink(child, destPath);
        }
      });
    } else {
      fs.symlinkSync(resolvedSrc, resolvedDest, type);
    }
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
  return glob__default.sync(pattern, options).map(dirPath => path__default.basename(dirPath));
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

function render({
  input,
  output,
  data = {}
}) {
  if (fs.existsSync(input)) {
    if (fs.existsSync(output)) {
      fs.unlinkSync(output);
    }

    const template = fs.readFileSync(input, 'utf-8');
    fse.outputFileSync(output, mustache.render(template, data));
  }
}

function buildNamespaceName({
  root = '',
  extensionName
} = {}) {
  if (typeof extensionName === 'string') {
    const fragments = extensionName.split('.').filter((item, index, arr) => index + 1 < arr.length).map(item => `${item.charAt(0).toUpperCase()}${item.slice(1)}`);
    const namespace = fragments.join('.');

    if (typeof root === 'string' && root !== '') {
      return `${root}.${namespace}`;
    }

    return namespace;
  }

  return root;
}

const templatePath = path.resolve(appRoot, 'src/templates/extension');
const configTemplatePath = path.resolve(templatePath, 'bundle.config.js');
const inputTemplatePath = path.resolve(templatePath, 'input.js');
const defaultOptions = {
  test: true,
  flow: false
};
function createExtension(directory, options = defaultOptions) {
  if (typeof directory !== 'string') {
    throw new Error('directory is not string');
  }

  if (!fs.existsSync(directory)) {
    throw new Error('directory is not exists');
  }

  const extensionPath = path.resolve(directory, options.name.toLowerCase());
  const inputPath = path.resolve(extensionPath, `src/${options.name}.js`);
  const outputPath = path.resolve(extensionPath, `dist/${options.name}.bundle.js`);
  const configPath = path.resolve(extensionPath, 'bundle.config.js');
  const extensionName = buildExtensionName(inputPath, extensionPath);
  const namespaceName = buildNamespaceName({
    root: 'BX',
    extensionName
  });
  render({
    input: inputTemplatePath,
    output: inputPath,
    data: {
      name: camelcase(options.name, {
        pascalCase: true
      })
    }
  });
  render({
    input: configTemplatePath,
    output: configPath,
    data: {
      input: slash(path.relative(extensionPath, inputPath)),
      output: slash(path.relative(extensionPath, outputPath)),
      namespace: namespaceName
    }
  });

  if (options.tests) {
    const testTemplatePath = path.resolve(templatePath, 'test.js');
    const testFilePath = path.resolve(extensionPath, `test/${options.name}/${options.name}.test.js`);
    render({
      input: testTemplatePath,
      output: testFilePath,
      data: {
        name: camelcase(options.name, {
          pascalCase: true
        }),
        sourceName: options.name
      }
    });
  }

  if (options.flow) {
    bitrixFlow({
      path: extensionPath
    }, {
      init: true
    });
  }

  return {
    extensionName,
    functionName: camelcase(options.name, {
      pascalCase: true
    })
  };
}

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

async function bitrixCreate() {
  const answers = await ask([{
    name: 'Extension name',
    id: 'name',
    type: 'input',
    default: typeof argv._[1] === 'string' ? argv._[1] : '',
    validate: input => {
      if (typeof input === 'string' && input.length) {
        return true;
      }

      return 'Name should be not empty string';
    }
  }, {
    name: 'Enable tests',
    id: 'tests',
    type: 'confirm',
    default: true
  }, {
    name: 'Enable Flow',
    id: 'flow',
    type: 'confirm',
    default: false
  }]);
  const extInfo = createExtension(params.path, answers);
  const info = box(`
		${'Success!'.bold}
		Extension ${extInfo.extensionName} created
		
		Run ${`bitrix build -p ./${answers.name}`.bold} for build extension
		
		${'Include extension in php'.bold}
		\\Bitrix\\Main\\Extension::load('${extInfo.extensionName}');
		
		${'or import in your js code'.bold}
		import {${extInfo.functionName}} from '${extInfo.extensionName}';
	`); // eslint-disable-next-line

  return Logger.log(info);
}

module.exports = bitrixCreate;
