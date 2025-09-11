export class MemoryCache
{
	private store = new Map<string, any>();

	get<T>(key: string, defaultValue?: T | (() => T)): T | undefined
	{
		if (this.store.has(key))
		{
			return this.store.get(key) as T;
		}
		return typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
	}

	set<T>(key: string, value: T): void
	{
		this.store.set(key, value);
	}

	remember<T>(key: string, callback: () => T): T
	{
		const existing = this.get<T>(key);
		if (existing !== undefined)
		{
			return existing;
		}

		const value = callback();
		this.set(key, value);

		return value;
	}

	forget(key: string): void
	{
		this.store.delete(key);
	}

	flush(): void
	{
		this.store.clear();
	}
}
