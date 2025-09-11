import { ConfigStrategy } from '../../config.strategy';

export const bundleJsStrategy = {
	key: 'bundle_js',
	getDefault(): string
	{
		return '';
	},
	prepare(value: any): string
	{
		return value;
	},
	validate(value: any): true | string
	{
		return true;
	},
} satisfies ConfigStrategy<string>
