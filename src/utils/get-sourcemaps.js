export default function getSourcemaps({output}) {
	const mapPath = output.replace('.js', '');

	return {
		js: `${mapPath}.js.map`,
		css: `${mapPath}.css.map`,
	};
}