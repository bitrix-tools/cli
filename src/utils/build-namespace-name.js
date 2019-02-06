
export default function buildNamespaceName({root = '', extensionName} = {}) {
	if (typeof extensionName === 'string') {
		const fragments = extensionName.split('.')
			.filter((item, index, arr) => index+1 < arr.length)
			.map(item => `${item.charAt(0).toUpperCase()}${item.slice(1)}`);
		const namespace = fragments.join('.');

		if (typeof root === 'string' && root !== '') {
			return `${root}.${namespace}`;
		}

		return namespace;
	}

	return root;
}