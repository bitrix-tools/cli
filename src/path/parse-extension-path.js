// @flow
import slash from 'slash';
import path from 'path';
import findExtensionContext from './find-extension-context';

interface Result {
	root: string,
	module: string,
	jsDir: string,
	extension: Array<string>,
	filePath: string,
}

/**
 * Parses any extensions paths
 * @example
 * /../local/js/main/core/core.js
 * /../bitrix/js/main/core/core.js
 * /../bitrix/modules/main/install/js/main/core/core.js
 * /../local/modules/main/install/js/main/core/core.js
 * /../modules/main/install/js/main/core/core.js
 */
export default function parseExtensionPath(sourcePath: string = ''): ?Result {
	const preparedPath: string = slash(sourcePath);
	const installJsExp = new RegExp('/(.[a-z0-9-_]+)/modules/(.[a-z0-9-_]+)/install/js/(.[a-z0-9-_]+)/');
	const productJsExp = new RegExp('/(.[a-z0-9-_]+)/js/((.[a-z0-9-_]+))/');
	const moduleResult = preparedPath.match(installJsExp) || preparedPath.match(productJsExp);

	if (
		!!moduleResult
		&& !!moduleResult[1]
		&& !!moduleResult[2]
		&& !!moduleResult[3]
	)
	{
		const context = findExtensionContext(preparedPath);

		if (context)
		{
			const [jsPath, rootDirname, module, jsDir] = moduleResult;
			const root = ['bitrix', 'local'].includes(rootDirname) ? rootDirname : 'bitrix';
			const [, filePath] = preparedPath.split(path.join(context, '/'));
			const extension = (() => {
				const [, extPath = ''] = context.split(jsPath);
				return extPath.split('/');
			})();

			return {
				root,
				module,
				jsDir,
				extension,
				filePath,
			};
		}
	}

	return null;
}