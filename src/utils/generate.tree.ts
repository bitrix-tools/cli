import chalk from 'chalk';
import { formatSize } from './format.size';
import type { DependencyNode } from '../modules/packages/types/dependency.node';

export function generateTreeString(tree: Array<DependencyNode>, prefix = ''): string
{
	const lines: string[] = [];

	for (let i = 0; i < tree.length; i++)
	{
		const node = tree[i];
		const isLast = i === tree.length - 1;
		const connector = isLast ? '└─ ' : '├─ ';
		const nextPrefix = prefix + (isLast ? '   ' : '│  ');

		const preparedKey = node.visited ? chalk.grey(node.name) : node.name;
		const sizes = [];

		if (node.bundlesSize?.js > 0)
		{
			const formattedJsSize = formatSize({
				size: node.bundlesSize.js,
				prefix: 'js: ',
			});

			if (node.bundlesSize.js > (100 * 1024))
			{
				sizes.push(chalk.red(formattedJsSize));
			}
			else if (node.bundlesSize.js > (50 * 1024))
			{
				sizes.push(chalk.yellow(formattedJsSize));
			}
			else
			{
				sizes.push(formattedJsSize);
			}
		}

		if (node.bundlesSize?.css > 0)
		{
			const formattedCssSize = formatSize({
				size: node.bundlesSize.css,
				prefix: 'css: ',
			});

			if (node.bundlesSize.css > (50 * 1024))
			{
				sizes.push(chalk.red(formattedCssSize));
			}
			else if (node.bundlesSize.css > (25 * 1024))
			{
				sizes.push(chalk.yellow(formattedCssSize));
			}
			else
			{
				sizes.push(formattedCssSize);
			}
		}

		const formattedSizes = (() => {
			if (sizes.length > 0)
			{
				return ` ${chalk.italic(sizes.join(', '))}`;
			}

			return '';
		})();

		lines.push(prefix + connector + preparedKey + formattedSizes);

		if (node.children && node.children.length > 0)
		{
			const childTree = generateTreeString(node.children, nextPrefix);
			lines.push(childTree);
		}
	}

	return lines.join('\n');
}
