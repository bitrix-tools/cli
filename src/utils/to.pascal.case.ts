export function toPascalCase(str: string): string
{
	const parts = str.split(/\W+/);
	const filteredParts = parts.filter((part) => part.length > 0);

	return filteredParts
		.map((part) => {
			return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
		})
		.join('');
}
