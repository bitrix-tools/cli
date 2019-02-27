import slash from 'slash';

export default function isComponentPath(filePath) {
	const exp = new RegExp('/(.[a-z0-9]+)/install/components/(.[a-z0-9]+)/');
	const res = `${slash(filePath)}`.match(exp);
	return !!res && !!res[1] && !!res[2];
};
