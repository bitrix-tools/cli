import { ConfigStrategy } from '../../config.strategy';

export const namespaceFunctionStrategy = {
	key: 'namespaceFunction',
	getDefault(): null | Function
	{
		return null;
	},
	prepare(value: any): null | Function
	{
		return value;
	},
	validate(value: any): true | string
	{
		if (value === null || typeof value === 'function')
		{
			return true;
		}

		return 'Invalid \'namespaceFunction\' value.';
	},
} satisfies ConfigStrategy<null | Function>
