// @flow

import path from 'path';
import Logger from '@bitrix/logger';
import colors from 'colors/safe';
import Directory from '../entities/directory';
import concat from './concat';
import report from './report';
import test from './test';
import rollupBundle from './build/rollup';
import adjustExtension from './build/adjust-extension';
import argv from '../process/argv';

/*
	eslint
 	"no-restricted-syntax": "off",
 	"no-await-in-loop": "off"
*/

async function buildDirectory(dir, recursive = true) {
	const directory = new Directory(dir);
	const configs = directory.getConfigs(recursive);

	// @todo Remove global state change
	global.currentDirectory = path.resolve(dir);

	for (const config of configs) {
		let testResult;

		try {
			const {imports} = await rollupBundle(config);
			await concat(config.concat.js, config.output.js);
			await concat(config.concat.css, config.output.css);
			await adjustExtension(imports, config);

			if (argv.test || argv.t) {
				testResult = await test(config.context);
			}
		} catch (error) {
			report({config, error});
			return;
		}

		report({config, testResult});
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
