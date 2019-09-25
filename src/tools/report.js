import 'colors';
import logSymbols from 'log-symbols';
import filesize from 'filesize';
import * as fs from 'fs';
import Logger from '@bitrix/logger';
import isModulePath from '../utils/is-module-path';
import buildExtensionName from '../utils/build-extension-name';
import isComponentPath from '../utils/is-component-path';
import buildComponentName from '../utils/build-component-name';
import isTemplatePath from '../utils/is-template-path';
import buildTemplateName from '../utils/build-template-name';
import getNowTime from '../utils/get-now-time';

function printRow(row) {
	const reportTime = String(getNowTime()).grey;
	const nameCell = ` ${row.infoSymbol} ${reportTime} Build ${row.type} ${row.name}`;
	const testCell = `${row.testStatus || ''}`;
	const sizeCell = `${row.jsSize ? `js: ${row.jsSize}` : ''}${row.cssSize ? `, css: ${row.cssSize}` : ''}`.grey;

	Logger.log(`${nameCell} ${testCell} ${sizeCell}`);
}

function printError(error) {
	if (error) {
		if (error.code === 'UNRESOLVED_IMPORT') {
			Logger.log(`    Error: ${error.message}`.red);
			return;
		}

		if (error.code === 'PLUGIN_ERROR') {
			Logger.log(`    Error: ${error.message.replace('undefined:', '')}`.red);
			return;
		}

		throw new Error(error);
	}
}

export default function report({config, testResult, error}) {
	const reportData = {
		testStatus: '',
		jsSize: '',
		cssSize: '',
		summarySize: '',
		infoSymbol: '',
	};

	if (testResult === 'passed') {
		reportData.testStatus = 'tests passed'.green;
	}

	if (testResult === 'failure') {
		reportData.testStatus = 'tests failed'.red;
	}

	if (testResult === 'notests') {
		reportData.testStatus = 'no tests'.grey;
	}

	const jsBundle = config.output.js;
	if (fs.existsSync(jsBundle)) {
		const stat = fs.statSync(jsBundle);
		reportData.jsSize = filesize(stat.size, {round: 0});
		reportData.summarySize = stat.size;
	}

	const cssBundle = config.output.css;
	if (fs.existsSync(cssBundle)) {
		const stat = fs.statSync(cssBundle);
		reportData.cssSize = filesize(stat.size, {round: 0});
		reportData.summarySize += stat.size;
	}

	reportData.summarySize = filesize(reportData.summarySize, {round: 0});

	if (error) {
		reportData.infoSymbol = logSymbols.error;
	} else {
		reportData.infoSymbol = logSymbols.success;
	}

	if (isModulePath(config.input)) {
		const name = buildExtensionName(config.input, config.context);

		printRow({...reportData, type: 'extension', name});
		printError(error);
		return;
	}

	if (isComponentPath(config.input)) {
		const name = buildComponentName(config.input);

		printRow({...reportData, type: 'component', name});
		printError(error);
		return;
	}

	if (isTemplatePath(config.input)) {
		const name = buildTemplateName(config.input);

		printRow({...reportData, type: 'template', name});
		printError(error);
		return;
	}

	printRow({...reportData, type: 'bundle', name: config.output.js});
	printError(error);
}