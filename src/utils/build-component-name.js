import slash from 'slash';

export default function buildComponentName(filePath) {
	const normalizedPath = `${slash(filePath)}`;
	const regExp = new RegExp('/(.[a-z0-9]+)/install/components/(.[a-z0-9]+)/');
	const res = normalizedPath.match(regExp);

	if (res)
	{
		return `${res[2]}:${normalizedPath.split(res[0])[1].split('/')[0]}`;
	}

	const localExp = new RegExp('/local/components/(.[a-z0-9]+)/');
	const localRes = normalizedPath.match(localExp);

	return `${localRes[1]}:${normalizedPath.split(localRes[0])[1].split('/')[0]}`;
}