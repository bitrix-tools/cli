import { ConfigStrategy } from '../../config.strategy';

export const langStrategy = {
	key: 'lang',
	getDefault(): string | Array<string>
	{
		return '';
	},
	prepare(value: any): string | Array<string>
	{
		return value;
	},
	validate(value: any): true | string
	{
		return true;
	},
} satisfies ConfigStrategy<string | Array<string>>
