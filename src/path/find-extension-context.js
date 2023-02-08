// @flow
import fs from 'fs';
import path from 'path';

const maxDepth = 10;

export default function findExtensionContext(sourcePath: string, depth: number = 0): ?string {
	const configPath = path.join(sourcePath, 'bundle.config.js');

	if (fs.existsSync(configPath)) {
		return sourcePath;
	}

	if (sourcePath.length > 1 && depth < maxDepth)
	{
		const nextDepth = depth + 1;
		const dirname = path.dirname(sourcePath);
		return findExtensionContext(dirname, nextDepth);
	}

	return null;
}