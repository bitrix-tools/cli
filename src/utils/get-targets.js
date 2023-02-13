// @flow
import fs from 'fs';
import path from 'path';

const rcFileName = '.browserslistrc';

const allowedConfigs = [
	'.browserslistrc',
	'.browserslist',
];

export function getTargets(context: string): Array<string> {
	if (typeof context === 'string' && context !== '')
	{
		const rcFilePath = path.resolve(context, rcFileName);
		if (fs.existsSync(rcFilePath))
		{
			const content = fs.readFileSync(rcFilePath, 'utf-8');
			if (typeof content === 'string')
			{
				return content.split('\n').map((rule) => {
					return rule.trim();
				});
			}
		}
		else
		{
			if (
				context !== path.sep
				&& !/^[A-Z]:\\$/.test(context)
			)
			{
				return getTargets(path.dirname(context));
			}
		}
	}

	return [
		'IE >= 11',
		'last 4 version',
	];
}