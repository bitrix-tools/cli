export default function getSourcemaps({ output }) {
	let mapPath = output.replace('.js', '');

	return {
		js: `${mapPath}.js.map`,
		css: `${mapPath}.css.map`
	};
}