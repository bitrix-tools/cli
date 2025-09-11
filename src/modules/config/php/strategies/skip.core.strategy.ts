import { ConfigStrategy } from '../../config.strategy';

export const skipCoreStrategy = {
	key: 'skip_core',
	getDefault(): boolean
	{
		return false;
	},
	prepare(value: any): boolean
	{
		return value;
	},
	validate(value: any): true | string
	{
		return true;
	},
} satisfies ConfigStrategy<boolean>
