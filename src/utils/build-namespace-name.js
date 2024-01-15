// @flow
interface BuildNamespaceOptions {
	root: string,
	extensionName: string,
}

function buildNamespaceName({root = '', extensionName}: BuildNamespaceOptions = {}) {
	if (typeof extensionName === 'string') {
		const namespace = extensionName
			.split('.')
			.slice(0, -1)
			.map((name) => {
				if (name.length === 2)
				{
					return name.toUpperCase();
				}

				return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
			})
			.join('.');

		if (typeof root === 'string' && root !== '')
		{
			return `${root}.${namespace}`;
		}

		return namespace;
	}

	return root;
}

export default buildNamespaceName;
