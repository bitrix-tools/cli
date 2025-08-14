import * as fs from 'node:fs';

export function hasIndicators(dir: string, indicators: Array<string>): boolean
{
	const files = fs.readdirSync(dir);

	return indicators.every((indicator) => {
		return files.includes(indicator)
	});
}
