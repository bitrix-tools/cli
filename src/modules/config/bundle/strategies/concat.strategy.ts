import { ConfigStrategy } from '../../config.strategy';
import type { SourceBundleConfig } from '../source.bundle.config';

export const concatStrategy = {
	key: 'concat',
	getDefault(): SourceBundleConfig['concat']
	{
		return {};
	},
	prepare(value: any): SourceBundleConfig['concat']
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
} satisfies ConfigStrategy<SourceBundleConfig['concat']>
