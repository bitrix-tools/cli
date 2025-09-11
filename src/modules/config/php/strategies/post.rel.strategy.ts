import { ConfigStrategy } from '../../config.strategy';

export const postRelStrategy = {
	key: 'post_rel',
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
