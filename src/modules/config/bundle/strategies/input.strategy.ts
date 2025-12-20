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
	save(configContent: string, value: string): string
	{
		const regexp = /input:(?:\s+)?(['"])(.*)(['"])/g;

		return configContent.replace(regexp, `input: $1${value}$3`);
	},
} satisfies ConfigStrategy<string>
