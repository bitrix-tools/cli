import { ConfigStrategy } from '../../config.strategy';

export const includesStrategy = {
	key: 'includes',
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
