import { ConfigStrategy } from '../../config.strategy';
import type { BundleConfig } from '../bundle.config';

export const concatStrategy = {
	key: 'concat',
	getDefault(): BundleConfig['concat']
	{
		return {};
	},
	prepare(value: any): BundleConfig['concat']
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

		return 'Invalid \'concat\' value.';
	},
} satisfies ConfigStrategy<BundleConfig['concat']>
