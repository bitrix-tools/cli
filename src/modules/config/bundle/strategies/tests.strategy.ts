import { ConfigStrategy } from '../../config.strategy';
import { BundleConfig } from '../bundle.config';

export const testsStrategy = {
	key: 'tests',
	getDefault(): BundleConfig['tests']
	{
		return {
			localization: {
				languageId: 'en',
				autoLoad: true,
			},
		};
	},
	prepare(value: any): BundleConfig['tests']
	{
		if (value && typeof value === 'object')
		{
			return { ...this.getDefault(), ...value };
		}

		return this.getDefault();
	},
	validate(value: any): true | string
	{
		if (value && typeof value === 'object')
		{
			return true;
		}

		return 'Invalid \'test\' value';
	},
} satisfies ConfigStrategy<BundleConfig['tests']>
