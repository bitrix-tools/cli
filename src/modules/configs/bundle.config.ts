import * as fs from 'node:fs';
import { type SourceBundleConfig } from '../../types/source.bundle.config.type';

export class BundleConfig
{
	#sourceConfig: SourceBundleConfig;
	#resultConfig: SourceBundleConfig;

	constructor(configPath: string)
	{
		if (fs.existsSync(configPath))
		{
			this.#sourceConfig = require(configPath);
		}
	}
}
