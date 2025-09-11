export function formatSize(bytes: number, decimals: number = 2): string {
	if (bytes === 0)
	{
		return '0 B';
	}

	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	const formatted = (bytes / Math.pow(k, i)).toFixed(decimals);

	return `${formatted} ${sizes[i]}`;
}
