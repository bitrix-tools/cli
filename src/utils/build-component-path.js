import slash from 'slash';

export default function buildComponentPath(filePath) {
	const normalizedPath = `${slash(filePath)}`;
	const exp = new RegExp('/(.[a-z0-9_-]+)/install/components/(.[a-z0-9_-]+)/');
	const res = normalizedPath.match(exp);
	return `/bitrix/components/${res[2]}/${normalizedPath.split(res[0])[1]}`;
}