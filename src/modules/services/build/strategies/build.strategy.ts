import type { BuildResult, BuildOptions, BuildCodeOptions, BuildCodeResult } from '../types/build.service.types';


export abstract class BuildStrategy
{
	static sortDependencies(dependencies: string[]): string[]
	{
		const uniqueDependencies = [...new Set(dependencies)];

		return uniqueDependencies.sort((a, b) => {
			const aParts = a.split('.');
			const bParts = b.split('.');

			for (let i = 0; i < Math.min(aParts.length, bParts.length); i++)
			{
				const comparison = aParts[i].localeCompare(bParts[i]);
				if (comparison !== 0)
				{
					return comparison;
				}
			}

			return aParts.length - bParts.length;
		});
	}

	abstract build(options: BuildOptions): Promise<BuildResult>;
	abstract buildCode(options: BuildCodeOptions): Promise<BuildCodeResult>;
	abstract generate(options: BuildOptions) : Promise<BuildResult>;
}
