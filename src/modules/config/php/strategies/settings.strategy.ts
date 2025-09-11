import { ConfigStrategy } from '../../config.strategy';

export const settingsStrategy = {
	key: 'settings',
	getDefault(): { [key: string]: any }
	{
		return {};
	},
	prepare(value: any): { [key: string]: any }
	{
		return value;
	},
	validate(value: any): true | string
	{
		return true;
	},
} satisfies ConfigStrategy<{ [key: string]: any }>
