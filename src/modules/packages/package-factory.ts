import type { BasePackage } from './base-package';

export interface PackageFactoryStrategy {
	match({ path }): boolean;
	create({ path }): BasePackage;
}

export type PackageFactoryOptions = {
	strategies: Array<PackageFactoryStrategy>,
	defaultStrategy: PackageFactoryStrategy,
};

export class PackageFactory
{
	readonly #strategies: Array<PackageFactoryStrategy>;
	readonly #defaultStrategy: PackageFactoryStrategy;

	constructor(options: PackageFactoryOptions)
	{
		this.#strategies = options.strategies;
		this.#defaultStrategy = options.defaultStrategy;
	}

	create({ path }: { path: string }): BasePackage
	{
		for (const strategy of this.#strategies)
		{
			if (strategy.match({ path }))
			{
				return strategy.create({ path });
			}
		}

		return this.#defaultStrategy.create({ path });
	}
}
