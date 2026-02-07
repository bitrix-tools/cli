export function createInputFileName(extensionName: string, fileExtension: string): string
{
	const fileExtensionWithDot = fileExtension.length > 0 ? `.${fileExtension}` : fileExtension;

	return `${extensionName.split('.').at(-1)}${fileExtensionWithDot}`;
}
