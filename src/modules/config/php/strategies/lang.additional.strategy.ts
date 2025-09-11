import { ConfigStrategy } from '../../config.strategy';

export const langAdditionalStrategy = {
	key: 'lang_additional',
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
