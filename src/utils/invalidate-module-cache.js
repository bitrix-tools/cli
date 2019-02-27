
export default function invalidateModuleCache(module, recursive, store = []) {
	if (typeof module === 'string') {
		const resolvedModule = require.resolve(module);

		if (require.cache[resolvedModule] && !store.includes(resolvedModule)) {
			store.push(resolvedModule);

			if (Array.isArray(require.cache[resolvedModule].children) && recursive) {
				require.cache[resolvedModule].children.forEach((currentModule) => {
					invalidateModuleCache(currentModule.id, recursive, store);
				});
			}

			delete require.cache[resolvedModule];
		}
	}
}