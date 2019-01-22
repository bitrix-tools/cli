import slash from 'slash';

export default function buildComponentPath(filePath) {
	filePath = slash(filePath);
	let exp = new RegExp('\/(.[a-z0-9_-]+)\/install\/components\/(.[a-z0-9_-]+)\/');
	let res = filePath.match(exp);
	return `/bitrix/components/${res[2]}/${filePath.split(res[0])[1]}`;
};