import slash from 'slash';

export default function isModulePath(filePath) {
	const moduleExp = new RegExp('/(.[a-z0-9-_]+)/install/js/(.[a-z0-9-_]+)/');
	const moduleRes = `${slash(filePath)}`.match(moduleExp);

	if (!!moduleRes && !!moduleRes[1] && !!moduleRes[2])
	{
		return true;
	}

	const localExp = new RegExp('/local/js/(.[a-z0-9-_]+)/(.[a-z0-9-_]+)/');
	const localRes = `${slash(filePath)}`.match(localExp);

	return !!localRes && !!localRes[1] && !!localRes[2];
}