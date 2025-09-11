import { ConfigStrategy } from '../../config.strategy';

export const cssStrategy = {
	key: 'css',
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
