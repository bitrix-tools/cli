import slash from 'slash';
import path from 'path';

export default function isAllowed(fileName) {
	if (typeof fileName !== 'string') {
		return false;
	}

	fileName = slash(fileName);

	if ((new RegExp('\/components\/(.*)\/style.js')).test(fileName) ||
		(new RegExp('\/components\/(.*)\/style.css')).test(fileName)) {
		return false;
	}

	let ext = path.extname(fileName);

	switch (ext) {
		case '.js':
		case '.jsx':
		case '.css':
		case '.scss':
			return true;
		default:
			return false;
	}
};
