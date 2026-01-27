import type { BasePackage } from './base-package';
import { Environment } from '../../environment/environment';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { PackageFactoryProvider } from './providers/package-factory-provider';
import { MemoryCache } from '../../utils/memory-cache';

const isExtensionName = (name: string) => {
	return /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(name);
};

export class PackageResolver
{
	static #cache: MemoryCache = new MemoryCache();

	static resolve(packageName: string): BasePackage | null
	{
		return this.#cache.remember(packageName, () => {
			if (isExtensionName(packageName))
			{
				const segments = packageName.split('.');
				const root = Environment.getRoot();
				const packageFactory = PackageFactoryProvider.create();

				if (Environment.getType() === 'source')
				{
					const moduleName = segments.at(0);
					const extensionPath = path.join(root, moduleName, 'install', 'js', ...segments);
					if (fs.existsSync(extensionPath))
					{
						return packageFactory.create({
							path: extensionPath,
						});
					}
				}

				if (Environment.getType() === 'project')
				{
					const localExtensionPath = path.join(root, 'local', 'js', ...segments);
					if (fs.existsSync(localExtensionPath))
					{
						return packageFactory.create({
							path: localExtensionPath,
						});
					}

					const productExtensionPath = path.join(root, 'bitrix', 'js', ...segments);
					if (fs.existsSync(productExtensionPath))
					{
						return packageFactory.create({
							path: productExtensionPath,
						});
					}
				}
			}

			return null;
		});
	}
}
