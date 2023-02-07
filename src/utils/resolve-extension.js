import fs from 'fs';
import path from 'path';
import isLocalPath from './is-local-path';
import isModulePath from './is-module-path';

type ResolverOptions = {
	name: string,
	sourcePath: string,
};

type ResolverResult = {
	context: string,
	input: string,
	bundleConfig: string,
};

function belongLocalExtension(path: string) {
	return isLocalPath(path);
}

function belongModulesExtension(path: string) {
	return isModulePath(path);
}

export default function resolveExtension(options: ResolverOptions): ?ResolverResult {
	const extensionPath = (() => {
		const nameSegments = String(options.name).split('.');

		if (belongLocalExtension(options.sourcePath))
		{
			const [productRoot] = String(options.sourcePath).split(path.join('local', 'js'));

			const localExtensionPath = path.join(productRoot, 'local', 'js', ...nameSegments);
			if (fs.existsSync(localExtensionPath))
			{
				return localExtensionPath;
			}

			const productExtensionPath = path.join(productRoot, 'bitrix', 'js', ...nameSegments);
			if (fs.existsSync(productExtensionPath))
			{
				return productExtensionPath;
			}

			return null;
		}

		if (belongModulesExtension(options.sourcePath))
		{
			const [modulesRoot] = /.*modules/.exec(String(options.sourcePath));
			const [moduleName] = nameSegments;
			const moduleExtensionPath = path.join(modulesRoot, moduleName, 'install', 'js', ...nameSegments);
			if (fs.existsSync(moduleExtensionPath))
			{
				return moduleExtensionPath;
			}
		}

		return null;
	})();

	if (typeof extensionPath === 'string')
	{
		const configPath = path.join(extensionPath, 'bundle.config.js');
		if (fs.existsSync(configPath))
		{
			const config = require(configPath);
			if (config)
			{
				return {
					context: extensionPath,
					input: path.join(extensionPath, config.input),
					bundleConfig: configPath,
				};
			}
		}
	}

	return null;
}