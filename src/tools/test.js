import Mocha from 'mocha';
import glob from 'fast-glob';
import path from 'path';
import fs from 'fs';
import Logger from '@bitrix/logger';
import argv from '../process/argv';
import invalidateModuleCache from '../utils/invalidate-module-cache';
import {appRoot} from '../constants';
import Directory from '../entities/directory';
import loadMessages from '../utils/load-messages';
import buildExtensionName from '../utils/build-extension-name';

/*
	eslint
 	"no-restricted-syntax": "off",
 	"no-await-in-loop": "off"
*/

export function reporterStub() {}

function appendBootstrap() {
	const bootstrapPath = path.resolve(appRoot, 'dist/test.bootstrap.js');
	invalidateModuleCache(bootstrapPath);
	// eslint-disable-next-line
	require(bootstrapPath);
}

export async function testDirectory(dir, report = true) {
	const directory = new Directory(dir);
	const configs = directory.getConfigs();
	const result = [];

	if (!report) {
		global.currentDirectory = path.resolve(dir);
	}

	const mocha = new Mocha({
		globals: Object.keys(global),
		reporter: argv.test || argv.t || !report ? reporterStub : 'spec',
		checkLeaks: true,
		timeout: 10000,
	});

	appendBootstrap();

	configs.forEach((config) => {
		if (fs.existsSync(path.resolve(config.context, 'test'))) {
			const extensionTests = glob.sync(path.resolve(config.context, 'test/**/*.js'));
			if (extensionTests.length > 0) {
				if (config.tests.localization.autoLoad)
				{
					loadMessages({
						extension: {
							name: buildExtensionName(config.input, config.context),
							lang: config.tests.localization.languageId,
							cwd: config.context,
						},
					});
				}

				extensionTests.forEach((testFile) => {
					const recursive = true;
					invalidateModuleCache(testFile, recursive);
					mocha.addFile(testFile);
				});
			}
		}
	});

	await new Promise((resolve) => {
		mocha
			.run((failures) => {
				result.push(failures ? 'failure' : 'passed');
			})
			.on('end', () => resolve());
	});

	if (result.every(res => res === 'no-tests')) {
		return 'no-tests';
	}

	if (result.some(res => res === 'passed')
		&& result.every(res => res !== 'failure')) {
		return 'passed';
	}

	return 'failed';
}

export default async function test(dir, report = true) {
	if (Array.isArray(dir)) {
		for (const item of dir) {
			const testStatus = await testDirectory(item, report);
			let testResult = '';

			if (testStatus === 'passed') {
				testResult = 'passed'.green;
			}

			if (testStatus === 'failure') {
				testResult = 'failed'.red;
			}

			if (testStatus === 'notests') {
				testResult = 'no tests'.grey;
			}

			// eslint-disable-next-line
			Logger.log(`Test module ${item}`.bold, `${testResult}`);
		}
	} else if (typeof dir === 'string') {
		return testDirectory(dir, report);
	} else {
		throw new Error('dir not string or array');
	}

	return '';
}
