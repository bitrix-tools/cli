// @flow
import slash from 'slash';
import * as path from 'path';

interface ParseModuleInstallPathResult {
	root: string,
	module: string,
	jsDir: string,
	extension: Array<string>,
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
export default function parseExtensionPath(sourcePath: string = ''): ?ParseModuleInstallPathResult {
	const preparedPath = slash(sourcePath);
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
		const extension = (() => {
			const [, extPath = ''] = preparedPath.split(moduleResult[0]);
			return path.dirname(extPath).split(path.sep);
		})();

		const root = (() => {
			const [, rootDirname] = moduleResult;
			return ['bitrix', 'local'].includes(rootDirname) ? rootDirname : 'bitrix';
		})();

		const [,, module, jsDir] = moduleResult;

		return {
			root,
			module,
			jsDir,
			extension,
		};
	}

	return null;
}