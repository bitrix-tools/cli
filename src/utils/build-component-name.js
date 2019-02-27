import slash from 'slash';

export default function buildComponentName(filePath) {
	const normalizedPath = `${slash(filePath)}`;
	const regExp = new RegExp('/(.[a-z0-9]+)/install/components/(.[a-z0-9]+)/');
	const res = normalizedPath.match(regExp);
	return `${res[2]}:${normalizedPath.split(res[0])[1].split('/')[0]}`;
}