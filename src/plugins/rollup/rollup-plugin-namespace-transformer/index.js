export default function namespaceTransformer(options = {}) {
	return {
		name: 'rollup-plugin-namespace-transformer',
		renderChunk(code) {
			let normalizedCode = code;

			if (options.namespaceFunction) {
				const lastLine = code.split(/\r?\n/).pop();
				const parsedNamespace = lastLine.match(/this\.(.*)\s=/);
				let namespace = null;

				if (parsedNamespace && parsedNamespace[1]) {
					[namespace] = parsedNamespace;
				}

				const modifiedLastLine = lastLine
					.replace(/\((.*?)\)/, `(${options.namespaceFunction}("${namespace}")`);

				normalizedCode = code
					.replace(lastLine, modifiedLastLine)
					.replace(/^this(.*) \|\| {};/gm, '')
					.trim();
			}

			return {code: normalizedCode, map: null};
		},
	};
}