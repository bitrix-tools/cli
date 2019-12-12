// @flow
import slash from 'slash';
import * as path from 'path';

interface Result {
	root: string,
	namespace: string,
	component: string,
	template: string,
	filePath: string,
}

export default function parseComponentTemplatePath(sourcePath: string = ''): ?Result {
	const preparedPath = slash(sourcePath);
	const installComponentsExp = new RegExp(
		'/(.[a-z0-9_-]+)/modules/.[a-z0-9_-]+/install/components/(.[a-z0-9_-]+)/(.[.a-z0-9_-]+)/templates/(.[.a-z0-9_-]+)/',
	);
	const productComponentsExp = new RegExp(
		'/(bitrix|local)/components/(.[a-z0-9_-]+)/(.[.a-z0-9_-]+)/templates/(.[.a-z0-9_-]+)/',
	);
	const installComponentsResult = (
		preparedPath.match(installComponentsExp)
		|| preparedPath.match(productComponentsExp)
	);

	if (
		!!installComponentsResult
		&& !!installComponentsResult[1]
		&& !!installComponentsResult[2]
		&& !!installComponentsResult[3]
		&& !!installComponentsResult[4]
	) {
		const [templatePath, , namespace, component, template] = installComponentsResult;
		const [, filePath] = preparedPath.split(path.join(templatePath));
		const root = (() => {
			const [, rootDirname] = installComponentsResult;
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