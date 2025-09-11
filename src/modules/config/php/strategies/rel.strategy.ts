import { ConfigStrategy } from '../../config.strategy';

export const relStrategy = {
	key: 'rel',
	getDefault(): Array<string>
	{
		return [];
	},
	prepare(value: any): Array<string>
	{
		return value;
	},
	validate(value: any): true | string
	{
		return true;
	},
} satisfies ConfigStrategy<Array<string>>
