import fs from 'fs';
import path from 'path';
import isModulePath from '../../utils/is-module-path';
import generateConfigPhp, {renderRel} from '../../utils/generate-config-php';

export default async function adjustExtension(bundleImports, config) {
	const bundleConfigPath = path.resolve(config.context, 'bundle.config.js');
	const configPhpPath = path.resolve(config.context, 'config.php');

	if (config.adjustConfigPhp && (isModulePath(config.input) || fs.existsSync(bundleConfigPath))) {
		if (!fs.existsSync(configPhpPath)) {
			fs.writeFileSync(configPhpPath, generateConfigPhp(config));
		}

		const extNameExp = /^(\w).(.[\w.])/;
		let imports = [...bundleImports].filter(item => extNameExp.test(item));

		if (!imports.includes('main.core') && !imports.includes('main.polyfill.core')) {
			imports = ['main.polyfill.core', ...imports];
		}

		// Updates dependencies list
		const relExp = /['"]rel['"] => (\[.*?\])(,?)/s;
		let configContent = fs.readFileSync(configPhpPath, 'utf-8');
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

			fs.writeFileSync(configPhpPath, configContent);
		}
	}
}