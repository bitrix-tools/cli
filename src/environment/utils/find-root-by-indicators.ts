import * as path from 'node:path';
import { hasIndicators } from './has-indicators';

export function findRootByIndicator(startDir: string, indicators: string[]): string {
	let currentDir = startDir;

	while (true)
	{
		if (hasIndicators(currentDir, indicators))
		{
			return currentDir;
		}

		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir)
		{
			break;
		}

		currentDir = parentDir;
	}

	return null;
}
