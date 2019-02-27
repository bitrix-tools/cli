import slash from 'slash';
import * as path from 'path';

export default function buildExtensionName(filePath, context) {
	const exp = new RegExp('/(.[a-z0-9_-]+)/install/js/(.[a-z0-9_-]+)/');
	const res = `${slash(filePath)}`.match(exp);

	if (!Array.isArray(res)) {
		return path.basename(context);
	}

	const fragments = `${slash(context)}`.split(`${res[1]}/install/js/${res[2]}/`);

	return `${res[2]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
}