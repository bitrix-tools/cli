import { ConfigStrategy } from '../../config.strategy';

export const inputStrategy = {
	key: 'input',
	getDefault(): any
	{
		return './script.es6.js';
	},
	prepare(value: any): string
	{
		return String(value);
	},
	validate(value: any): true | string
	{
		return true;
	},
} satisfies ConfigStrategy<string>
