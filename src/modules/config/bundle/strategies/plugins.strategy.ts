import { ConfigStrategy } from '../../config.strategy';
import type { BundleConfig } from '../bundle.config';

export const pluginsStrategy = {
	key: 'plugins',
	getDefault(): {}
	{
		return {};
	},
	prepare(value: any): BundleConfig['plugins']
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
} satisfies ConfigStrategy<BundleConfig['plugins']>
