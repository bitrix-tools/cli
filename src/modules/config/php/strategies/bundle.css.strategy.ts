import { ConfigStrategy } from '../../config.strategy';

export const bundleCssStrategy = {
	key: 'bundle_css',
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
