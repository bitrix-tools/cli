
export default function invalidateModuleCache(module, recursive, store = []) {
	if (typeof module === 'string') {
		module = require.resolve(module);

		if (require.cache[module] && !store.includes(module)) {
			store.push(module);

			if (Array.isArray(require.cache[module].children) && recursive) {
				require.cache[module].children.forEach(module => {
					invalidateModuleCache(module.id, recursive, store);
				});
			}

			delete require.cache[module];
		}
	}
}