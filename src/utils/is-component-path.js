import slash from 'slash';

export default function isComponentPath(filePath) {
	let exp = new RegExp('\/(.[a-z0-9]+)\/install\/components\/(.[a-z0-9]+)\/');
	let res = slash(filePath).match(exp);
	return !!res && !!res[1] && !!res[2];
};
