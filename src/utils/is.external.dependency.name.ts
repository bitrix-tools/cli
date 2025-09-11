export function isExternalDependencyName(name: string): boolean
{
	return !name.startsWith('./');
}
