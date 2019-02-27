import slash from 'slash';

export default function isModulePath(filePath) {
	const exp = new RegExp('/(.[a-z0-9-_]+)/install/js/(.[a-z0-9-_]+)/');
	const res = `${slash(filePath)}`.match(exp);
	return !!res && !!res[1] && !!res[2];
}