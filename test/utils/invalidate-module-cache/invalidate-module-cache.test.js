import assert from 'assert';
import invalidateModuleCache from '../../../src/utils/invalidate-module-cache';

describe('utils/invalidate-module-cache', () => {
	it('Should be exported as function', () => {
		assert(typeof invalidateModuleCache === 'function');
	});

	it('Should invalidates current module cache only', () => {
		const appModule = require.resolve('./data/app');
		const child1 = require.resolve('./data/child1');
		const child2 = require.resolve('./data/child2');
		require(appModule);

		assert(appModule in require.cache);
		assert(child1 in require.cache);
		assert(child2 in require.cache);

		invalidateModuleCache(appModule);

		assert(!(appModule in require.cache));
		assert(child1 in require.cache);
		assert(child2 in require.cache);
	});

	it('Should invalidates module with dependencies', () => {
		const appModule = require.resolve('./data/app');
		const child1 = require.resolve('./data/child1');
		const child2 = require.resolve('./data/child2');
		require(appModule);

		assert(appModule in require.cache);
		assert(child1 in require.cache);
		assert(child2 in require.cache);

		invalidateModuleCache(appModule, true);

		assert(!(appModule in require.cache));
		assert(!(child1 in require.cache));
		assert(!(child2 in require.cache));
	});

	it('Should not throws if module name not string', () => {
		assert.doesNotThrow(() => {
			invalidateModuleCache();
			invalidateModuleCache(true);
			invalidateModuleCache(null);
			invalidateModuleCache({});
			invalidateModuleCache(() => {});
		});
	});

	it('Should throws if module doesn\'t exists', () => {
		assert.throws(() => {
			invalidateModuleCache('./test');
		});

		assert.throws(() => {
			invalidateModuleCache('./testmodule');
		});
	});
});