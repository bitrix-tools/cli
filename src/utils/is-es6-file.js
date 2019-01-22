export default function isEs6File(path) {
	return typeof path === 'string' && path.endsWith('script.es6.js');
}