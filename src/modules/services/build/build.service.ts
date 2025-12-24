import type { BuildStrategy } from './strategies/build.strategy';
import type { BuildResult, BuildOptions, BuildCodeOptions, BuildCodeResult } from './types/build.service.types';

export class BuildService
{
	protected readonly strategy: BuildStrategy;

	constructor(strategy: BuildStrategy)
	{
		this.strategy = strategy;
	}

	async build(options: BuildOptions): Promise<BuildResult>
	{
		return this.strategy.build(options);
	}

	async buildCode(options: BuildCodeOptions): Promise<BuildCodeResult>
	{
		return this.strategy.buildCode(options);
	}

	async generate(options: BuildOptions): Promise<BuildResult>
	{
		return this.strategy.generate(options);
	}
}
