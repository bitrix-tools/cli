import type { BuildResult, BuildOptions, BuildCodeOptions, BuildCodeResult } from '../types/build.service.types';


export abstract class BuildStrategy
{
	abstract build(options: BuildOptions): Promise<BuildResult>;
	abstract buildCode(options: BuildCodeOptions): Promise<BuildCodeResult>;
	abstract generate(options: BuildOptions) : Promise<BuildResult>;
}
