import slash from 'slash';

export default function buildModulePath(filePath) {
	filePath = slash(filePath);
	let exp = new RegExp('\/(.[a-z0-9_-]+)\/install\/js\/(.[a-z0-9_-]+)\/');
	let res = filePath.match(exp);
	return `/bitrix/js/${res[2]}/${filePath.split(res[0])[1]}`;
};
