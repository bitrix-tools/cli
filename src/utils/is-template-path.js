import slash from 'slash';

export default function isTemplatePath(filePath) {
	const exp = new RegExp('/(.[a-z0-9_-]+)/install/templates/(.[a-z0-9_-]+)/');
	const res = `${slash(filePath)}`.match(exp);
	return !!res && !!res[1] && !!res[2];
}