import 'colors';
import logSymbols from 'log-symbols';
import filesize from 'filesize';
import fs from 'fs';
import path from 'path';
import url from 'url';
import Logger from '@bitrix/logger';
import isModulePath from '../utils/is-module-path';
import buildExtensionName from '../utils/build-extension-name';
import isComponentPath from '../utils/is-component-path';
import buildComponentName from '../utils/build-component-name';
import isTemplatePath from '../utils/is-template-path';
import buildTemplateName from '../utils/build-template-name';
import getNowTime from '../utils/get-now-time';
import isLocalPath from '../utils/is-local-path';

function printRow(row) {
	const reportTime = String(getNowTime()).grey;
	const nameCell = ` ${row.infoSymbol} ${reportTime} Build ${row.type} ${row.name}`;
	const testCell = `${row.testStatus || ''}`;
	const sizeCell = `${row.jsSize ? `js: ${row.jsSize}` : ''}${row.cssSize ? `, css: ${row.cssSize}` : ''}`.grey;

	Logger.log(`${nameCell} ${testCell} ${sizeCell}`);
}

function printError(error, config) {
	if (error) {
		if (error.code === 'UNRESOLVED_IMPORT') {
			const fileUrl = url.pathToFileURL(
				path.join(
					config.context,
					error.message.split('from ').at(-1),
				),
			);
			Logger.log(`   Build error: ${error.message}`.red);
			Logger.log(`   ${fileUrl.href}`.red);
			return;
		}

		if (error.code === 'PLUGIN_ERROR') {
			let errorMessage = error.message.replace('unknown: ', '');
			const fileUrl = url.pathToFileURL(`${error.id}:${error.loc.line}:${error.loc.column}`);
			if (fileUrl)
			{
				errorMessage = errorMessage.split('\n');
				errorMessage.splice(1, 0, `   ${fileUrl.href}`);
				errorMessage = errorMessage.join('\n');
			}

			Logger.log(`   Build error: ${errorMessage}`.red);
			return;
		}

		if (error.code === 'MISSING_EXPORT')
		{
			const fileUrl = url.pathToFileURL(`${error.loc.file}:${error.loc.line}:${error.loc.column}`);
			Logger.log(`   Build error: ${error.message}`.red);
			Logger.log(`   ${fileUrl.href}`.red);
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

	if (isModulePath(config.input) || isLocalPath(config.input)) {
		const name = buildExtensionName(config.input, config.context);

		printRow({...reportData, type: 'extension', name});
		printError(error, config);
		return;
	}

	if (isComponentPath(config.input)) {
		const name = buildComponentName(config.input);

		printRow({...reportData, type: 'component', name});
		printError(error, config);
		return;
	}

	if (isTemplatePath(config.input)) {
		const name = buildTemplateName(config.input);

		printRow({...reportData, type: 'template', name});
		printError(error, config);
		return;
	}

	printRow({...reportData, type: 'bundle', name: config.output.js});
	printError(error, config);
}