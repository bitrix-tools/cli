// @flow

import {join} from 'path';
import {existsSync} from 'fs';
import type BundleConfig from '../@types/config';

export default function getGlobals(imports: string[], {context}: BundleConfig): {[key: string]: string} {
	return imports.reduce((accumulator, extensionName) => {
		const parsedExtensionName = extensionName.split('.');
		const moduleName = parsedExtensionName.shift();

		const localModuleJsRoot = join(context.split(join('local', 'js'))[0], 'local', 'js', moduleName);
		const localExtensionPath = join(localModuleJsRoot, join(...parsedExtensionName));
		let configPath = join(localExtensionPath, 'bundle.config.js');

		if (!existsSync(configPath))
		{
			const moduleRoot = (() => {
				if (context.includes('local'))
				{
					const projectRoot = context.split('local')[0];
					const bitrixModulesRoot = join(projectRoot, 'bitrix', 'modules');
					if (existsSync(bitrixModulesRoot))
					{
						return join(bitrixModulesRoot, moduleName);
					}
				}

				return join(context.split('modules')[0], 'modules', moduleName);
			})();
			const moduleJsRoot = join(moduleRoot, 'install', 'js', moduleName);
			const extensionPath = join(moduleJsRoot, join(...parsedExtensionName));
			configPath = join(extensionPath, 'bundle.config.js');
		}

		let moduleAlias = 'BX';

		if (existsSync(configPath)) {
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