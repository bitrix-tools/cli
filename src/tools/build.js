import path from 'path';
import Logger from '@bitrix/logger';
import colors from 'colors/safe';
import Directory from '../entities/directory';
import concat from './concat';
import test from './test';
import rollupBundle from './build/rollup';
import adjustExtension from './build/adjust-extension';
import argv from '../process/argv';
import isNeedInstallNpmDependencies from '../utils/is-need-install-npm-dependencies';
import printBuildStatus from '../utils/print-build-status';
import getFileSize from '../utils/get-filesize';
import buildName from '../utils/build-name';

async function buildDirectory(dir, recursive = true) {
	const directory = new Directory(dir);
	const configs = directory.getConfigs(recursive);

	// @todo Remove global state change
	global.currentDirectory = path.resolve(dir);

	for (const config of configs) {
		let testsStatus;

		const isNeedNpmInstall = isNeedInstallNpmDependencies(config);
		if (isNeedNpmInstall)
		{
			printBuildStatus({
				status: 'error',
				name: buildName(config),
				needNpmInstall: true,
				context: config.context,
			});
		}
		else
		{
			try {
				const {imports} = await rollupBundle(config);
				await concat(config.concat.js, config.output.js);
				await concat(config.concat.css, config.output.css);
				await adjustExtension(imports, config);

				if (argv.test || argv.t) {
					testsStatus = await test(config.context);
				}
			} catch (error) {
				printBuildStatus({
					status: 'error',
					name: buildName(config),
					context: config.context,
				});
				console.error(` ${error.name}: ${error.message}`);
				return;
			}

			printBuildStatus({
				status: 'success',
				name: buildName(config),
				context: config.context,
				bundleSize: {
					js: getFileSize(config.output.js),
					css: getFileSize(config.output.css),
				},
				testsStatus,
			});
		}
	}
}

async function build(dir: string, recursive: boolean) {
	if (Array.isArray(dir)) {
		for (const item of dir) {
			Logger.log(colors.bold(`Build module ${path.basename(item)}`));
			await buildDirectory(item, recursive);
		}
	} else if (typeof dir === 'string') {
		await buildDirectory(dir, recursive);
	} else {
		throw new Error('dir not string or array');
	}
}

export default build;
