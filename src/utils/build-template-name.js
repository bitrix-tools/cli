import slash from 'slash';

export default function buildTemplateName(filePath) {
	const exp = new RegExp('/(.[a-z0-9_-]+)/install/templates/(.[a-z0-9_-]+)/');
	const res = `${slash(filePath)}`.match(exp);
	return res && res[2];
}