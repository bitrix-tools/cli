import { ConfigStrategy } from '../../config.strategy';

export const treeshakeStrategy = {
	key: 'treeshake',
	getDefault(): boolean
	{
		return true;
	},
	prepare(value: any): boolean
	{
		if (typeof value === 'boolean')
		{
			return value;
		}

		return this.getDefault();
	},
	validate(value: any): true | string
	{
		if (typeof value === 'boolean')
		{
			return true;
		}

		return 'Invalid \'treeshake\' value';
	},
} satisfies ConfigStrategy<boolean>
