// @flow
import * as fs from 'fs';
import * as path from 'path';

const maxDepth = 10;

export default function findExtensionContext(sourcePath: string, depth: number = 0): ?string {
	const dirname = path.dirname(sourcePath);
	const configPath = path.join(dirname, 'bundle.config.js');

	if (fs.existsSync(configPath)) {
		return dirname;
	}

	if (dirname.length > 1 && depth < maxDepth)
	{
		const nextDepth = depth + 1;
		return findExtensionContext(dirname, nextDepth);
	}

	return null;
}