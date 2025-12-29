import { ConfigStrategy } from '../../config.strategy';

export const hooksStrategy = {
	key: 'hooks',
	getDefault(): any
	{
		return {};
	},
	prepare(value: any): Record<any, any> | any
	{
		return value;
	},
	validate(value: any): true | string
	{
		return true;
	},
} satisfies ConfigStrategy<string>
