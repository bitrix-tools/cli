// @flow
import slash from 'slash';
import * as path from 'path';

interface Result {
	root: 'bitrix' | 'local',
	template: string,
	filePath: string,
}

export default function parseSiteTemplatePath(sourcePath: string = ''): ?Result {
	const preparedPath = slash(sourcePath);
	const installTemplatesExp = new RegExp('/(.[a-z0-9_-]+)/modules/.[a-z0-9_-]+/install/templates/(.[a-z0-9_-]+)/');
	const productTemplatesExp = new RegExp('/(.[a-z0-9-_]+)/templates/((.[a-z0-9-_]+))/');
	const templateResult = (
		preparedPath.match(installTemplatesExp)
		|| preparedPath.match(productTemplatesExp)
	);

	if (
		!!templateResult
		&& !!templateResult[1]
		&& !!templateResult[2]
	) {
		const root = (() => {
			const [, rootDirname] = templateResult;
			return ['bitrix', 'local'].includes(rootDirname) ? rootDirname : 'bitrix';
		})();
		const [templatePath,, template] = templateResult;
		const [, filePath] = preparedPath.split(path.join(templatePath));

		return {
			root,
			template,
			filePath,
		};
	}

	return null;
}