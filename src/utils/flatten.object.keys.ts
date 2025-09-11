export function flattenObjectKeys(obj: Record<string, any>): Array<string>
{
	const keys = new Set();

	function walk(current)
	{
		if (current && typeof current === 'object' && !Array.isArray(current))
		{
			for (const key of Object.keys(current))
			{
				keys.add(key);
				walk(current[key]);
			}
		}
	}

	walk(obj);

	return Array.from(keys) as Array<string>;
}
