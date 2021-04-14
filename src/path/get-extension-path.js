// @flow
import {existsSync} from 'fs';
import {join} from 'path';

/**
 * Port of bitrix getLocalPath()
 *
 * @link https://bxapi.ru/src/?module_id=main&name=getLocalPath
 * @param {string} projectRoot Absolute path to project root
 * @param {string} relativePath Path relative to bitrix folder
 * @returns {string|null}
 */
function getLocalPath(projectRoot: string, relativePath: string, baseFolder: string = 'bitrix') {
	if (existsSync(join(projectRoot, 'local', relativePath))) {
		return join(projectRoot, 'local', relativePath);
	}
	if (existsSync(join(projectRoot, baseFolder, relativePath))) {
		return join(projectRoot, baseFolder, relativePath);
	}
	return null;
}

/**
 * Guess absolute path to project root
 *
 * @param {string} context Project folder
 * @returns {string}
 */
function guessProjectRoot(context: string) {
	return context.split(/\/(bitrix|local)\//)[0];
}


/**
 * Port of bitrix \Bitrix\Main\UI\Extension::getPath()
 *
 * @link https://bxapi.ru/src/?module_id=main&name=getPath
 * @param {string} context Absolute path to built bundle
 * @param {string} extensionName
 * @returns {string|null}
 */
export function getExtensionPath(extensionName: string, context: string): ?string {
	if (!(typeof extensionName === 'string')) {
		return null;
	}

	const namespaces = extensionName.split('.');
	if (namespaces.length < 2) {
		return null;
	}

	const projectRoot = guessProjectRoot(context);
	if (!projectRoot) {
		return null;
	}

	const pathParts = ['js'];
	for (let i = 0; i < namespaces.length; i++) {
		if (!namespaces[i].match(/^[a-z0-9_\\.\-]+$/)) {
			return null;
		}
		pathParts.push(namespaces[i]);
	}

	return getLocalPath(projectRoot, join(...pathParts));
}
