export function createOutputFileName(extensionName: string, fileExtension: string): string
{
	return `${extensionName.split('.').at(-1)}.bundle.${fileExtension}`;
}
