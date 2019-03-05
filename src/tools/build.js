import {existsSync, readFileSync, writeFileSync} from 'fs';
import {resolve, basename} from 'path';
import {rollup} from 'rollup';
import logSymbols from 'log-symbols';
import Logger from '@bitrix/logger';
import isModulePath from '../utils/is-module-path';
import buildRollupConfig from '../utils/build-rollup-config';
import generateConfigPhp, {renderRel} from '../utils/generate-config-php';
import Directory from '../entities/directory';
import getGlobals from '../utils/get-globals';
import concat from './concat';
import 'colors';

/*
	eslint
 	"no-restricted-syntax": "off",
 	"no-await-in-loop": "off"
*/

async function buildDirectory(dir, recursive = true) {
	const directory = new Directory(dir);
	const configs = directory.getConfigs(recursive);

	// @todo Remove global state change
	global.currentDirectory = resolve(dir);

	for (const config of configs) {
		const {input, output} = buildRollupConfig(config);

		// @todo Remove global state change
		global.outputOptions = output;

		// Build
		try {
			const bundle = await rollup(input);
			await bundle.write({...output, ...{globals: getGlobals(bundle.imports, config)}});
			await concat(config.concat.js, config.output);
			await concat(config.concat.css, config.output);

			// Generate config.php if needed
			const bundleConfigPath = resolve(config.context, 'bundle.config.js');
			const configPhpPath = resolve(config.context, 'config.php');

			if (config.adjustConfigPhp && (isModulePath(input.input) || existsSync(bundleConfigPath))) {
				if (!existsSync(configPhpPath)) {
					writeFileSync(configPhpPath, generateConfigPhp(config));
				}

				const extNameExp = /^(\w).(.[\w.])/;
				let imports = [...bundle.imports].filter(item => extNameExp.test(item));

				if (!imports.includes('main.core') && !imports.includes('main.polyfill.core')) {
					imports = ['main.polyfill.core', ...imports];
				}

				// Updates dependencies list
				const relExp = /['"]rel['"] => (\[.*?\])(,?)/s;
				let configContent = readFileSync(configPhpPath, 'utf-8');
				const result = configContent.match(relExp);

				if (Array.isArray(result) && result[1]) {
					const relativities = `[${renderRel(imports)}]`;
					configContent = configContent.replace(result[1], relativities);

					// Adjust skip_core
					const skipCoreExp = /['"]skip_core['"] => (true|false)(,?)/;
					const skipCoreResult = configContent.match(skipCoreExp);
					const skipCoreValue = !imports.includes('main.core');

					if (Array.isArray(skipCoreResult) && skipCoreResult[1]) {
						configContent = configContent
							.replace(skipCoreExp, `'skip_core' => ${skipCoreValue},`);
					} else {
						configContent = configContent
							.replace(relExp, `'rel' => ${relativities},\n\t'skip_core' => ${skipCoreValue},`);
					}

					writeFileSync(configPhpPath, configContent);
				}
			}
		} catch (error) {
			if (error.code === 'UNRESOLVED_IMPORT') {
				Logger.log(`   ${logSymbols.error} Error: ${error.message}`);
				return;
			}

			if (error.code === 'PLUGIN_ERROR') {
				Logger.log(`   ${logSymbols.error} ${error.message.replace('undefined:', 'Error:')}`);
				return;
			}

			throw new Error(error);
		}
	}
}

async function build(dir, recursive) {
	if (Array.isArray(dir)) {
		for (const item of dir) {
			// eslint-disable-next-line
			Logger.log(`Build module ${basename(item)}`.bold);

			await buildDirectory(item, recursive);
		}
	} else if (typeof dir === 'string') {
		await buildDirectory(dir, recursive);
	} else {
		throw new Error('dir not string or array');
	}
}

export default build;