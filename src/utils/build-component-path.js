import slash from 'slash';

export default function buildComponentPath(filePath) {
	const normalizedPath = `${slash(filePath)}`;
	const exp = new RegExp('/(.[a-z0-9_-]+)/install/components/(.[a-z0-9_-]+)/');
	const res = normalizedPath.match(exp);

	if (res)
	{
		return `/bitrix/components/${res[2]}/${normalizedPath.split(res[0])[1]}`;
	}

	const localExp = new RegExp('/local/components/(.[a-z0-9_-]+)/');
	const localRes = normalizedPath.match(localExp);

	return `/local/components/${localRes[1]}/${normalizedPath.split(localRes[0])[1]}`;
}