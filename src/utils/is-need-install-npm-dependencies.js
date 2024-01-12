import fs from 'fs';
import path from 'path';
import type BundleConfig from '../@types/config';

export default function isNeedInstallNpmDependencies(config: BundleConfig)
{
	if (typeof config === 'object' && config !== null)
	{
		const packageJsonPath = path.join(config.context, 'package.json');
		const hasPackageJson = fs.existsSync(packageJsonPath);

		const nodeModulesPath = path.join(config.context, 'node_modules');
		const hasNodeModules = fs.existsSync(nodeModulesPath);

		return (
			hasPackageJson === true
			&& hasNodeModules === false
		);
	}

	return false;
}
