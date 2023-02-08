// @flow
import slash from 'slash';
import path from 'path';

interface Result {
	root: string,
	namespace: string,
	component: string,
	template: string,
	filePath: string,
}

/**
 * Parses component template path
 * @example
 * /bitrix/modules/main/install/components/bitrix/news.list/templates/.default/script.js
 * /local/modules/main/install/components/bitrix/news.list/templates/.default/script.js
 * /.../modules/main/install/components/bitrix/news.list/templates/.default/script.js
 *
 * /.../modules/main/install/templates/.../components/bitrix/news.list/templates/.default/script.js
 *
 * /bitrix/components/bitrix/news.list/templates/.default/script.js
 * /local/components/bitrix/news.list/templates/.default/script.js
 *
 * /bitrix/templates/.../components/bitrix/news.list/templates/.default/script.js
 * /local/templates/.../components/bitrix/news.list/templates/.default/script.js
 */
export default function parseComponentTemplatePath(sourcePath: string = ''): ?Result {
	const preparedPath = slash(sourcePath);
	const installComponentsExp = new RegExp(
		'/(.[a-z0-9_-]+)/modules/.[a-z0-9_-]+/install/components/(.[a-z0-9_-]+)/(.[.a-z0-9_-]+)/templates/(.[.a-z0-9_-]+)/',
	);
	const productComponentsExp = new RegExp(
		'/(bitrix|local)/components/(.[a-z0-9_-]+)/(.[.a-z0-9_-]+)/templates/(.[.a-z0-9_-]+)/',
	);
	const moduleTemplateComponentsExp = new RegExp(
		'/(.[a-z0-9_-]+)/modules/.[a-z0-9_-]+/install/templates/.[a-z0-9_-]+/components/(.[a-z0-9_-]+)/(.[.a-z0-9_-]+)/templates/(.[.a-z0-9_-]+)/',
	);
	const productTemplateComponentsExp = new RegExp(
		'/(bitrix|local)/templates/.[a-z0-9_-]+/components/(.[a-z0-9_-]+)/(.[.a-z0-9_-]+)/templates/(.[.a-z0-9_-]+)/',
	);
	const componentsResult = (
		preparedPath.match(installComponentsExp)
		|| preparedPath.match(productComponentsExp)
		|| preparedPath.match(moduleTemplateComponentsExp)
		|| preparedPath.match(productTemplateComponentsExp)
	);

	if (
		!!componentsResult
		&& !!componentsResult[1]
		&& !!componentsResult[2]
		&& !!componentsResult[3]
		&& !!componentsResult[4]
	) {
		const [templatePath, , namespace, component, template] = componentsResult;
		const [, filePath] = preparedPath.split(path.join(templatePath));
		const root = (() => {
			const [, rootDirname] = componentsResult;
			return ['bitrix', 'local'].includes(rootDirname) ? rootDirname : 'bitrix';
		})();

		return {
			root,
			namespace,
			component,
			template,
			filePath,
		};
	}

	return null;
}