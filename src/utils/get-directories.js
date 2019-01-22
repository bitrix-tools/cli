import slash from 'slash';
import glob from 'fast-glob';
import path from 'path';

export default function getDirectories(dir) {
	const pattern = slash(path.resolve(dir, '**'));
	const options = {onlyDirectories: true, deep: 0};

	return glob.sync(pattern, options)
		.map(dirPath => path.basename(dirPath));
}