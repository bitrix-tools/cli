import { ConfigManager } from '../config.manager';
import * as bundleConfigStrategies from './strategies/index'
import * as path from 'node:path';
import { ConfigStrategy } from '../config.strategy';
import { SourceBundleConfig } from './source.bundle.config';
import { BundleConfig } from './bundle.config';
import { createRequire } from 'module';

export class BundleConfigManager extends ConfigManager<BundleConfig>
{
	constructor()
	{
		super();

		Object.values(bundleConfigStrategies).forEach((strategy: ConfigStrategy) => {
			this.registerStrategy(strategy.key, strategy);
		});
	}

	loadFromFile(configPath: string): any
	{
		const require = createRequire(import.meta.url);
		const sourceBundleConfig: SourceBundleConfig = require(path.resolve(configPath));

		Object.entries(sourceBundleConfig).forEach(([key, value]) => {
			this.set(key, value);
		});
	}

	async save(configPath: string): Promise<any>
	{
		return Promise<any>
	}
}
