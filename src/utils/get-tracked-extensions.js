import argv from '../process/argv';

const defaultExtensions = [
	'.js',
	'.jsx',
	'.vue',
	'.css',
	'.scss',
];

export default function getTrackedExtensions(): Array<string>
{
	if (typeof argv.watch === 'string' && argv.watch.length > 0)
	{
		return argv.watch
			.split(',')
			.map((extName) => {
				return String(extName).trim();
			})
			.reduce((acc, extName) => {
				if (typeof extName === 'string' && extName.length > 0)
				{
					if (extName === 'defaults')
					{
						return [...acc, ...defaultExtensions];
					}

					const preparedName = (() => {
						if (!extName.startsWith('.'))
						{
							return `.${extName}`;
						}

						return extName;
					})();

					if (!acc.includes(preparedName))
					{
						acc.push(preparedName);
					}
				}

				return acc;
			}, []);
	}

	return [...defaultExtensions];
}