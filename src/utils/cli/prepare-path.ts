import * as path from 'node:path';

export function preparePath(value: string): string | null
{
	if (typeof value === 'string')
	{
		return path.resolve(value);
	}

	return process.cwd();
}
