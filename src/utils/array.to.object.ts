export function arrayToObject<T extends string | number | symbol>(arr: T[]): Record<T, {}>
{
	return arr.reduce((acc, key) => {
		acc[key] = {};
		return acc;
	}, {} as Record<T, {}>);
}
