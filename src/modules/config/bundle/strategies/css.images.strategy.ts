import { ConfigStrategy } from '../../config.strategy';
import { BundleConfig } from '../bundle.config';

export const cssImagesStrategy = {
	key: 'cssImages',
	getDefault(): BundleConfig['cssImages']
	{
		return {
			type: 'inline',
			maxSize: 14,
			svgo: true,
		};
	},
	prepare(value: any): BundleConfig['cssImages']
	{
		if (value && typeof value === 'object')
		{
			return { ...this.getDefault(), ...value };
		}
	},
	validate(value: any): true | string
	{
		if (value && typeof value === 'object')
		{
			return true;
		}

		return 'Invalid \'cssImages\' value.';
	},
} satisfies ConfigStrategy<BundleConfig['cssImages']>
