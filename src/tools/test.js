import Mocha from 'mocha';
import glob from 'fast-glob';
import path from 'path';
import argv from '../process/argv';
import invalidateModuleCache from '../utils/invalidate-module-cache';
import { appRoot } from '../constants';
import Directory from '../entities/directory';

export default async function test(dir, report = true) {
	if (Array.isArray(dir)) {
		for (let item of dir) {
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

			console.log(`Test module ${item}`.bold, `${testResult}`);
		}
	} else if (typeof dir === 'string') {
		return await testDirectory(dir, report);
	} else {
		throw new Error('dir not string or array');
	}
}

export function reporterStub() {}

export async function testDirectory(dir, report = true) {
	const directory = new Directory(dir);
	const configs = directory.getConfigs();
	const result = [];

	if (!report) {
		global.currentDirectory = path.resolve(dir);
	}

	for (const config of configs) {
		const tests = glob.sync(path.resolve(config.context, 'test/**/*.js'));

		if (tests.length === 0) {
			result.push('notests');
		}

		const mocha = new Mocha({
			globals: Object.keys(global),
			allowUncaught: true,
			reporter: argv.test || argv.t || !report ? reporterStub : 'spec'
		});

		if (tests.length) {
			tests.forEach(test => {
				const recursive = true;
				invalidateModuleCache(test, recursive);
				mocha.addFile(test);
			});

			appendBootstrap();

			await new Promise(resolve => {
				mocha
					.run(failures => {
						result.push(failures ? 'failure' : 'passed');
					})
					.on('end', () => resolve());
			});
		}
	}

	if (result.every(res => res === 'notests')) {
		return 'notests';
	}

	if (result.some(res => res === 'passed') &&
		result.every(res => res !== 'failure')) {
		return 'passed';
	}

	return 'failure';
}

function appendBootstrap() {
	invalidateModuleCache(path.resolve(appRoot, 'dist/test.bootstrap.js'));
	require(path.resolve(appRoot, 'dist/test.bootstrap.js'));
}