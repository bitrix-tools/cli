import slash from 'slash';

export default function buildComponentName(filePath) {
	filePath = slash(filePath);
	let regExp = new RegExp('\/(.[a-z0-9]+)\/install\/components\/(.[a-z0-9]+)\/');
	let res = filePath.match(regExp);
	return `${res[2]}:${filePath.split(res[0])[1].split('/')[0]}`;
};