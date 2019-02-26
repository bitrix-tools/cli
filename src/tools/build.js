import {existsSync, readFileSync, writeFileSync} from 'fs';
import {resolve, basename} from 'path';
import {rollup} from 'rollup';
import isModulePath from '../utils/is-module-path';
import buildRollupConfig from '../utils/build-rollup-config';
import generateConfigPhp, {renderRel} from '../utils/generate-config-php';
import Directory from '../entities/directory';
import getGlobals from '../utils/get-globals';
import concat from './concat';
import 'colors';

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

			// Updates dependencies list
			const relExp = /['"]rel['"] => (\[.*?\])/s;
			let configContent = readFileSync(configPhpPath, 'utf-8');
			const result = configContent.match(relExp);

			if (Array.isArray(result) && result[1]) {
				const relativities = `[${renderRel(bundle.imports)}]`;
				configContent = configContent.replace(result[1], relativities);

				// Adjust skip_core
				const skipCoreExp = /['"]skip_core['"] => (true|false)/s;
				const skipCoreResult = configContent.match(skipCoreExp);
				const skipCoreValue = !bundle.imports.includes('main.core');

				if (Array.isArray(skipCoreResult) && skipCoreResult[1])
				{
					configContent = configContent
						.replace(skipCoreExp, `"skip_core" => ${skipCoreValue}`);
				}
				else
				{
					configContent = configContent
						.replace(relExp, `"rel" => ${relativities},\n\t"skip_core" => ${skipCoreValue}`);
				}

				writeFileSync(configPhpPath, configContent);
			}
		}
	}
}

async function build(dir, recursive) {
	if (Array.isArray(dir)) {
		for (const item of dir) {
			console.log(`Build module ${basename(item)}`.bold);

			await buildDirectory(item, recursive);
		}
	} else if (typeof dir === 'string') {
		await buildDirectory(dir, recursive);
	} else {
		throw new Error('dir not string or array');
	}
}

export default build;