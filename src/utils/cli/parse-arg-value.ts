export function parseArgValue(value: string): Array<string>
{
	return value.replace(/^=/, '').split(',');
}
