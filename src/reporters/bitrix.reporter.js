import 'colors';
import logSymbols from 'log-symbols';
import {resolve} from 'path';
import isModulePath from '../utils/is-module-path';
import buildExtensionName from '../utils/build-extension-name';
import isComponentPath from '../utils/is-component-path';
import buildComponentName from '../utils/build-component-name';
import isTemplatePath from '../utils/is-template-path';
import buildTemplateName from '../utils/build-template-name';
import Directory from '../entities/directory';

export default function bitrixReporter(bundle, argv = {}) {
	const directory = new Directory(global.currentDirectory || argv.path || argv.p || process.cwd());
	const configs = directory.getConfigs();
	const input = resolve(process.cwd(), bundle.bundle);
	const config = configs.find(currentConfig => (
		resolve(currentConfig.context, currentConfig.output).endsWith(bundle.bundle)
	));

	let testsStatus = '';
	let testResult = '';

	if (config && (argv.test || argv.t)) {
		testsStatus = global.testsStatus ? global.testsStatus[config.context] : '';

		if (testsStatus === 'passed') {
			testResult = 'tests passed'.green;
		}

		if (testsStatus === 'failure') {
			testResult = 'tests failed'.red;
		}

		if (testsStatus === 'notests') {
			testResult = 'no tests'.grey;
		}
	}

	if (isModulePath(input)) {
		const name = buildExtensionName(input, config.context);

		// eslint-disable-next-line
		console.log(` ${logSymbols.success} Build extension ${name} ${testResult}`);
		return;
	}

	if (isComponentPath(input)) {
		const name = buildComponentName(input);

		// eslint-disable-next-line
		console.log(` ${logSymbols.success} Build component ${name} ${testResult}`);
		return;
	}

	if (isTemplatePath(input)) {
		const name = buildTemplateName(input);

		// eslint-disable-next-line
		console.log(` ${logSymbols.success} Build template ${name} ${testResult}`);
		return;
	}

	// eslint-disable-next-line
	console.log(` ${logSymbols.success} Build bundle ${bundle.bundle} ${testResult}`);
}