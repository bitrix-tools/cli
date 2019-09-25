export default function getSourcemaps({output}) {
	return {
		js: `${output.js}.map`,
		css: `${output.css}.map`,
	};
}