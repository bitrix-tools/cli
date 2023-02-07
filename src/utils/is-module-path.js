import slash from 'slash';

export default function isModulePath(filePath) {
	const moduleExp = new RegExp('/(.[a-z0-9-_]+)/install/js/(.[a-z0-9-_]+)/');
	const moduleRes = `${slash(filePath)}`.match(moduleExp);

	return !!moduleRes && !!moduleRes[1] && !!moduleRes[2];
}