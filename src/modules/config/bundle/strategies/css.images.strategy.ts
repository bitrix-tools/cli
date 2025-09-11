import { ConfigStrategy } from '../../config.strategy';
import { SourceBundleConfig } from '../source.bundle.config';

export const cssImagesStrategy = {
	key: 'cssImages',
	getDefault(): SourceBundleConfig['cssImages']
	{
		return {
			type: 'inline',
			maxSize: 14,
			svgo: true,
		};
	},
	prepare(value: any): SourceBundleConfig['cssImages']
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
} satisfies ConfigStrategy<SourceBundleConfig['cssImages']>
