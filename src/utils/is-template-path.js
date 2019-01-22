import slash from 'slash';

export default function isTemplatePath(filePath) {
	let exp = new RegExp('\/(.[a-z0-9_-]+)\/install\/templates\/(.[a-z0-9_-]+)\/');
	let res = slash(filePath).match(exp);
	return !!res && !!res[1] && !!res[2];
};