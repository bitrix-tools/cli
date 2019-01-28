import { join } from 'path';
import { existsSync } from 'fs';

export default function getGlobals(imports: string[], { context }) {
	return imports.reduce((accumulator, extensionName) => {
		const parsedExtensionName = extensionName.split('.');
		const moduleName = parsedExtensionName.shift();

		const moduleRoot = join(context.split('modules')[0], 'modules', moduleName);
		const moduleJsRoot = join(moduleRoot, 'install', 'js', moduleName);
		const extensionPath = join(moduleJsRoot, join.apply(null, parsedExtensionName));
		const configPath = join(extensionPath, 'bundle.config.js');

		let moduleAlias = 'BX';

		if (existsSync(configPath)) {
			moduleAlias = 'window';

			const config = require(configPath);

			if (config.namespace && config.namespace.length) {
				moduleAlias = config.namespace;
			}
		}

		accumulator[extensionName] = moduleAlias;

		return accumulator;
	}, {});
}