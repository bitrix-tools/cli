import * as fs from 'node:fs/promises';
import { ConfigStrategy } from './config.strategy';

export abstract class ConfigManager<T>
{
	#registry: Map<string, ConfigStrategy> = new Map();
	#externalConfig: Partial<T> = {};
	#virtualConfig: Partial<T> = {};

	abstract loadFromFile(configPath: string): any

	registerStrategy(key: string, strategy: ConfigStrategy)
	{
		this.#registry.set(key, strategy);
	}

	set(key: string, value: any)
	{
		const preparedKey = String(key).trim();
		if (preparedKey.length > 0)
		{
			const strategy = this.#registry.get(key);
			if (strategy)
			{
				if (strategy.validate(value))
				{
					this.#virtualConfig[key] = value;
				}
				else
				{
					throw new Error(`Invalid value of '${key}'.`);
				}
			}
			// else
			// {
			// 	console.warn(`⚠️Unknown property '${key}'. Strategy not registered`);
			// }
		}
	}

	get(key: string): any
	{
		const strategy = this.#registry.get(key);
		if (strategy)
		{
			if (Object.hasOwn(this.#virtualConfig, key))
			{
				return strategy.prepare(this.#virtualConfig[key]);
			}

			if (Object.hasOwn(this.#externalConfig, key))
			{
				return strategy.prepare(this.#externalConfig[key]);
			}

			return strategy.getDefault();
		}
	}

	getAll(): T
	{
		return [...this.#registry.entries()].reduce((acc, [key]) => {
			return {
				...acc,
				[key]: this.get(key),
			};
		}, {} as T);
	}

	async save(configPath: string): Promise<any>
	{
		const configFileExists = await (async () => {
			try
			{
				await fs.access(configPath, fs.constants.F_OK);
				return true;
			}
			catch(error)
			{
				return false;
			}
		})();

		if (configFileExists)
		{
			const configContent = await fs.readFile(configPath, 'utf8');
			const newConfigContent = Object.entries(this.getAll()).reduce((acc, [key, value]) => {
				const strategy = this.#registry.get(key);
				if (typeof strategy?.save === 'function')
				{
					return strategy.save(acc, value);
				}

				return acc;
			}, configContent);

			if (configContent !== newConfigContent)
			{
				await fs.writeFile(configPath, newConfigContent);
			}
		}
	}
}
