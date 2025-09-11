export function pluralize(word: string, count: number): string
{
	return count + (count === 1 ? word : `${word}s`);
}
