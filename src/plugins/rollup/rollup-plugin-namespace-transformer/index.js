export default function namespaceTransformer(options = {}) {
	return {
		name: 'rollup-plugin-namespace-transformer',
		renderChunk(code) {
			if (options.namespaceFunction) {
				let lastLine = code.split(/\r?\n/).pop();
				let parsedNamespace = lastLine.match(/this\.(.*)\s=/);
				let namespace = null;

				if (parsedNamespace && parsedNamespace[1]) {
					namespace = parsedNamespace[1];
				}

				let modifiedLastLine = lastLine.replace(/\((.*?)\)/, `(${options.namespaceFunction}("${namespace}")`);

				code = code.replace(lastLine, modifiedLastLine);
				code = code.replace(/^this(.*) \|\| {};/gm, '').trim();
			}

			return {code, map: null}
		}
	}
}