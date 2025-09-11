import { ConfigStrategy } from '../../config.strategy';

export const transformClassesStrategy = {
	key: 'transformClasses',
	getDefault(): any
	{
		return false;
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

		return 'Invalid \'transformClasses\' value.';
	},
} satisfies ConfigStrategy<boolean>
