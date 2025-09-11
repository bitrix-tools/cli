import { LintResult } from '../../linter/lint.result';
import chalk from 'chalk';
import table from 'text-table';
import { ESLint } from 'eslint';

function truncateWords(str: string, maxLength: number): string
{
	if (str.length <= maxLength)
	{
		return str;
	}

	const truncated = str.substring(0, maxLength);

	return truncated.replace(/\s+\S*$/, '') + '...';
}

function getLevelIcon(severity: number): string
{
	if (severity === 2)
	{
		return chalk.red('✖');
	}
	if (severity === 1)
	{
		return chalk.yellow('⚠');
	}

	return chalk.white('•');
}

export async function verboseFormatter(result: LintResult): Promise<{ text: string; level: 'succeed' | 'warn' | 'fail'; }>
{
	const level = (() => {
		if (result.hasErrors())
		{
			return 'fail';
		}

		if (result.hasWarnings())
		{
			return 'warn';
		}

		return 'succeed';
	})();

	const text = result.getResults()
		.filter((resultItem: ESLint.LintResult) => {
			return resultItem.messages.length > 0
		})
		.map((resultItem: ESLint.LintResult) => {
			const head = `  ${chalk.bold(resultItem.filePath.split('/src/')[1])}`;
			const messages = table(
				resultItem.messages.map((message) => {
					return [
						`    ${getLevelIcon(message.severity)}`,
						`${message.line}:${message.column}`,
						message.ruleId ?? '',
						truncateWords(message.message, 60),
					];
				}),
				{
					align: ['l', 'l', 'l'],
				},
			);

			return `${head}\n${messages}\n`;
		}).join('\n');

	return {
		level,
		text,
	};
}
