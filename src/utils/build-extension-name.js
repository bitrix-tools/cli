import slash from 'slash';
import path from 'path';

export default function buildExtensionName(filePath, context) {
	const moduleExp = new RegExp('/(.[a-z0-9_-]+)/install/js/(.[a-z0-9_-]+)/');
	const moduleRes = `${slash(filePath)}`.match(moduleExp);

	if (Array.isArray(moduleRes)) {
		const fragments = `${slash(context)}`.split(`${moduleRes[1]}/install/js/${moduleRes[2]}/`);
		return `${moduleRes[2]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
	}

	const localExp = new RegExp('/local/js/(.[a-z0-9_-]+)/(.[a-z0-9_-]+)/');
	const localRes = `${slash(filePath)}`.match(localExp);

	if (!Array.isArray(localRes))
	{
		return path.basename(context);
	}

	const fragments = `${slash(context)}`.split(`/local/js/${localRes[1]}/`);
	return `${localRes[1]}.${fragments[fragments.length - 1].replace(/\/$/, '').split('/').join('.')}`;
}