import { ConfigStrategy } from '../../config.strategy';
import type { SourceBundleConfig } from '../source.bundle.config';

export const pluginsStrategy = {
	key: 'plugins',
	getDefault(): {}
	{
		return {};
	},
	prepare(value: any): SourceBundleConfig['plugins']
	{
		if (value && typeof value === 'object')
		{
			return value;
		}

		return this.getDefault();
	},
	validate(value: any): true | string
	{
		if (value && typeof value === 'object')
		{
			return true;
		}

		return 'Invalid \'plugins\' value';
	},
} satisfies ConfigStrategy<SourceBundleConfig['plugins']>
