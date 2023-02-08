import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';

const type = process.platform.includes('win') ? 'junction' : null;

export default function createSymlink(src, dest) {
	const resolvedSrc = path.resolve(src);
	const resolvedDest = path.resolve(dest);

	if (fs.existsSync(resolvedSrc)) {
		if (fs.lstatSync(resolvedSrc).isDirectory()) {
			const destDirPath = path.resolve(resolvedDest, `../${path.basename(resolvedSrc)}`);

			if (!fs.existsSync(destDirPath)) {
				fs.mkdirSync(destDirPath);
			}

			const children = glob.sync(path.join(resolvedSrc, '**'));

			children.forEach((child) => {
				if (typeof child === 'string') {
					const destPath = path.resolve(resolvedDest, path.basename(child));
					createSymlink(child, destPath);
				}
			});
		} else {
			fs.symlinkSync(resolvedSrc, resolvedDest, type);
		}
	}
}