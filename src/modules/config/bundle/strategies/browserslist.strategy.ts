import { ConfigStrategy } from '../../config.strategy';


export const browserslistStrategy = {
	key: 'browserslist',
	getDefault(): Array<string>
	{
		return [
			'IE >= 11',
			'last 4 version',
		];
	},
	prepare(value: any): string | Array<string>
	{
		if (value === false || value === undefined)
		{
			return [
				'IE >= 11',
				'last 4 version',
			];
		}

		return value;
	},
	validate(value: any): true | string
	{
		if (typeof value === 'string' || typeof value === 'boolean' || Array.isArray(value))
		{
			return true;
		}

		return 'Invalid \'browserslist\' value';
	},
} satisfies ConfigStrategy<boolean | string | Array<string>>
