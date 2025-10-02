type FormatSizeOptions = {
	size: number;
	decimals?: number;
	prefix?: string;
};

const k = 1024;
const sizes = ['B', 'KB', 'MB', 'GB'];

export function formatSize(options: FormatSizeOptions): string
{
	const { size, decimals = 2, prefix = '' } = options;

	if (size === 0)
	{
		return '0 B';
	}

	const i = Math.floor(Math.log(size) / Math.log(k));
	const formatted = (size / Math.pow(k, i)).toFixed(decimals);

	return `${prefix}${formatted} ${sizes[i]}`;
}
