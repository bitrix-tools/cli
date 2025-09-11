import { ConfigStrategy } from '../../config.strategy';

export const sourceMapsStrategy = {
	key: 'sourceMaps',
	getDefault(): any
	{
		return true;
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

		return 'Invalid \'sourceMaps\' value';
	},
} satisfies ConfigStrategy<boolean>
