import slash from 'slash';
import path from 'path';
import getTrackedExtensions from './get-tracked-extensions';

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

	return getTrackedExtensions()
		.includes(path.extname(normalizedFileName));
}
