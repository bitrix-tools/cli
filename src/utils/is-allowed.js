import slash from 'slash';
import path from 'path';

export default function isAllowed(fileName) {
	if (typeof fileName !== 'string') {
		return false;
	}

	const normalizedFileName = slash(fileName);

	if (
		(new RegExp('/components/(.*)/style.js')).test(normalizedFileName)
		|| (
			(new RegExp('/components/(.*)/style.css')).test(normalizedFileName)
			&& !(new RegExp('/components/(.*)/src/(.*)style.css')).test(normalizedFileName)
		)
	) {
		return false;
	}

	const ext = path.extname(normalizedFileName);

	switch (ext) {
		case '.js':
		case '.jsx':
		case '.vue':
		case '.css':
		case '.scss':
			return true;
		default:
			return false;
	}
}
