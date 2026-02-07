import * as path from 'node:path';
import { Environment } from '../../environment/environment';
import { PathIndicators } from '../path/path-indicators';

export function resolvePackage(extensionName: string): string | null
{
	const envType = Environment.getType();
	if (envType === 'unknown')
	{
		return null;
	}

	const root = Environment.getRoot();
	const [moduleName, ...trace] = extensionName.split('.');

	if (envType === 'source')
	{
		return path.join(root, moduleName, PathIndicators.getInstallJs(), moduleName, ...trace);
	}

	return path.join(root, PathIndicators.getLocalJs(), ...trace);
}
