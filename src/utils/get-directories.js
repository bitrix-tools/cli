import slash from 'slash';
import glob from 'fast-glob';
import path from 'path';
import fs from 'fs';

export default function getDirectories(dir) {
	if (fs.existsSync(path.resolve(dir)))
	{
		const pattern = slash(path.resolve(dir, '**'));
		const options = {onlyDirectories: true, deep: 0};

		return glob.sync(pattern, options)
			.map(dirPath => path.basename(dirPath));
	}

	return [];
}