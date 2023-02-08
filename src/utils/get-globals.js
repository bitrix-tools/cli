// @flow

import path from 'path';
import fs from 'fs';
import type BundleConfig from '../@types/config';

export default function getGlobals(imports: string[], {context}: BundleConfig): {[key: string]: string} {
	return imports.reduce((accumulator, extensionName) => {
		const parsedExtensionName = extensionName.split('.');
		const moduleName = parsedExtensionName.shift();

		const localModuleJsRoot = path.join(context.split(path.join('local', 'js'))[0], 'local', 'js', moduleName);
		const localExtensionPath = path.join(localModuleJsRoot, path.join(...parsedExtensionName));
		let configPath = path.join(localExtensionPath, 'bundle.config.js');

		if (!fs.existsSync(configPath))
		{
			const moduleRoot = (() => {
				if (context.includes('local'))
				{
					const projectRoot = context.split('local')[0];
					const bitrixModulesRoot = path.join(projectRoot, 'bitrix', 'modules');
					if (fs.existsSync(bitrixModulesRoot))
					{
						return path.join(bitrixModulesRoot, moduleName);
					}
				}

				return path.join(context.split('modules')[0], 'modules', moduleName);
			})();
			const moduleJsRoot = path.join(moduleRoot, 'install', 'js', moduleName);
			const extensionPath = path.join(moduleJsRoot, path.join(...parsedExtensionName));
			configPath = path.join(extensionPath, 'bundle.config.js');
		}

		let moduleAlias = 'BX';

		if (fs.existsSync(configPath)) {
			moduleAlias = 'window';

			// eslint-disable-next-line
			const config = require(configPath);

			if (config.namespace && config.namespace.length) {
				moduleAlias = config.namespace;
			}
		}

		accumulator[extensionName] = moduleAlias;

		return accumulator;
	}, {});
}