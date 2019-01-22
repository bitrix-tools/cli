import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'fast-glob';

const type = process.platform.includes('win') ? 'junction' : null;

export default function createSymlink(src, dest) {
	src = path.resolve(src);
	dest = path.resolve(dest);

	if (fs.existsSync(src)) {
		if (fs.lstatSync(src).isDirectory()) {
			const destDirPath = path.resolve(dest, `../${path.basename(src)}`);

			if (!fs.existsSync(destDirPath)) {
				fs.mkdirSync(destDirPath);
			}

			const children = glob.sync(path.join(src, '**'));

			children.forEach(child => {
				if (typeof child === 'string') {
					const destPath = path.resolve(dest, path.basename(child));
					createSymlink(child, destPath);
				}
			});
		} else {
			fs.symlinkSync(src, dest, type);
		}
	}
}