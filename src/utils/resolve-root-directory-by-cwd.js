import path from 'path';
import fs from 'fs';

export default function resolveRootDirectoryByCwd(cwd: string): ?{rootPath: ?string, type: string} {
	if (typeof cwd === 'string' && cwd.length > 0)
	{
		if (cwd.includes('modules'))
		{
			const [modulesPath] = /.*modules/.exec(cwd);
			if (
				typeof modulesPath === 'string'
				&& fs.existsSync(path.join(modulesPath, 'main'))
				&& fs.existsSync(path.join(modulesPath, 'ui'))
			)
			{
				return {
					rootPath: modulesPath,
					type: 'modules',
				};
			}
		}

		if (cwd.includes('local'))
		{
			const localPath = path.dirname(/.*local/.exec(cwd)[0]);
			if (
				typeof localPath === 'string'
				&& fs.existsSync(path.join(localPath, 'bitrix'))
			)
			{
				return {
					rootPath: localPath,
					type: 'product',
				};
			}
		}

		if (cwd.includes('bitrix'))
		{
			const productPath = path.dirname(/.*bitrix/.exec(cwd)[0]);
			if (
				typeof productPath === 'string'
				&& fs.existsSync(path.join(productPath, 'bitrix'))
				&& fs.existsSync(path.join(productPath, 'bitrix', 'js'))
				&& fs.existsSync(path.join(productPath, 'bitrix', 'modules'))
			)
			{
				return {
					rootPath: productPath,
					type: 'product',
				};
			}
		}

		const productPath = path.dirname(cwd);
		if (
			fs.existsSync(path.join(productPath, 'bitrix'))
			&& fs.existsSync(path.join(productPath, 'bitrix', 'js'))
			&& fs.existsSync(path.join(productPath, 'bitrix', 'modules'))
		)
		{
			return {
				rootPath: productPath,
				type: 'product',
			};
		}

		if (
			productPath !== path.sep
			&& !/^[A-Z]:\\$/.test(productPath)
		)
		{
			return resolveRootDirectoryByCwd(productPath);
		}
	}

	return null;
}