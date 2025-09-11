import { ConfigStrategy } from '../../config.strategy';
import {SourceBundleConfig} from '../source.bundle.config';

export const testsStrategy = {
	key: 'tests',
	getDefault(): SourceBundleConfig['tests']
	{
		return {
			localization: {
				languageId: 'en',
				autoLoad: true,
			},
		};
	},
	prepare(value: any): SourceBundleConfig['tests']
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
} satisfies ConfigStrategy<SourceBundleConfig['tests']>
