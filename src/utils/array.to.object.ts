export function arrayToObject<T extends string | number | symbol>(arr: T[]): Record<T, {}>
{
	return arr.reduce((acc, key: any) => {
		acc[key.name] = {};
		return acc;
	}, {} as Record<T, {}>);
}
