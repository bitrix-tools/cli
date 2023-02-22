import fs from 'fs';
import path from 'path';
import resolveRootDirectoryByCwd from './resolve-root-directory-by-cwd';

type ResolverOptions = {
	name: string,
	sourcePath: string,
	cwd?: string,
};

type ResolverResult = {
	context: string,
	input: string,
	bundleConfig: string,
};

export default function resolveExtension(options: ResolverOptions): ?ResolverResult {
	const extensionPath = (() => {
		const rootDirectory = (() => {
			if (options.cwd)
			{
				return resolveRootDirectoryByCwd(options.cwd);
			}

			return resolveRootDirectoryByCwd(path.dirname(options.sourcePath))
		})();
		if (rootDirectory)
		{
			const nameSegments = options.name.split('.');
			const [moduleName] = nameSegments;

			if (rootDirectory.type === 'modules')
			{
				return path.join(rootDirectory.rootPath, moduleName, 'install', 'js', ...nameSegments);
			}

			if (rootDirectory.type === 'product')
			{
				const localExtension = path.join(rootDirectory.rootPath, 'local', 'js', ...nameSegments);
				if (fs.existsSync(localExtension))
				{
					return localExtension;
				}

				const productExtension = path.join(rootDirectory.rootPath, 'bitrix', 'js', ...nameSegments);
				if (fs.existsSync(productExtension))
				{
					return productExtension;
				}
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