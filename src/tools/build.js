import isModulePath from '../utils/is-module-path';
import buildRollupConfig from '../utils/build-rollup-config';
import generateConfigPhp, { renderRel } from '../utils/generate-config-php';
import Directory from '../../src/entities/directory';
import getGlobals from '../utils/get-globals';
import concat from './concat';
import 'colors';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { rollup } from 'rollup';

async function build(dir, recursive) {
	if (Array.isArray(dir)) {
		for (let item of dir) {
			console.log(`Build module ${basename(item)}`.bold);

			await buildDirectory(item, recursive);
		}
	} else if (typeof dir === 'string') {
		await buildDirectory(dir, recursive);
	} else {
		throw new Error('dir not string or array');
	}
}

async function buildDirectory(dir, recursive = true) {
	const directory = new Directory(dir);
	let configs = directory.getConfigs(recursive);

	// @todo Remove global state change
	global.currentDirectory = resolve(dir);

	for (const config of configs) {
		let { input, output } = buildRollupConfig(config);

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
			const exp = /['"]rel['"] => (\[.*?\])/s;
			const configString = readFileSync(configPhpPath, 'utf-8');
			const result = configString.match(exp);

			if (Array.isArray(result) && result[1]) {
				const relativities = `[${renderRel(bundle.imports)}]`;
				const configContent = configString.replace(result[1], relativities);
				writeFileSync(configPhpPath, configContent);
			}
		}
	}
}

export default build;