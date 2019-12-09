import slash from 'slash';

export default function buildModulePath(filePath) {
	const normalizedPath = `${slash(filePath)}`;
	const exp = new RegExp('/(.[a-z0-9_-]+)/install/js/(.[a-z0-9_-]+)/');
	const res = normalizedPath.match(exp);

	if (res)
	{
		return `/bitrix/js/${res[2]}/${normalizedPath.split(res[0])[1]}`;
	}

	const expLocal = new RegExp('/local/js/(.[a-z0-9_-]+)/');
	const localRes = normalizedPath.match(expLocal);

	return `/local/js/${localRes[1]}/${normalizedPath.split(localRes[0])[1]}`;
}
