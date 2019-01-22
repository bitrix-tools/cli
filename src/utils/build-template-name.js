import slash from 'slash';

export default function buildTemplateName(filePath) {
	let exp = new RegExp('\/(.[a-z0-9_-]+)\/install\/templates\/(.[a-z0-9_-]+)\/');
	let res = slash(filePath).match(exp);
	return res && res[2];
};