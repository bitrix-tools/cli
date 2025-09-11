import { ConfigStrategy } from '../../config.strategy';

export const protectedStrategy = {
	key: 'protected',
	getDefault(): any
	{
		return false;
	},
	prepare(value: any): boolean
	{
		return value === true;
	},
	validate(value: any): true | string
	{
		if (typeof value === 'boolean')
		{
			return true;
		}

		return 'Invalid \'protected\' value';
	},
} satisfies ConfigStrategy<boolean>
