import chalk from 'chalk';
import { TASK_STATUS_ICON } from '../../../modules/task/icons';

import type { BasePackage } from '../../../modules/packages/base-package';
import type { Task } from '../../../modules/task/task';

const getIndent = (indent: number) => {
	return '  '.repeat(indent);
};

export function runUnitTestsTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Running unit tests...',
		run: async (context): Promise<any> => {
			const testResult = await extension.runUnitTests(args);

			const failedTests = [];
			let failedCount = 0;
			let pendingCount = 0;
			let passedCount = 0;
			let indent = 0;
			let reportLines: string[] = [];

			let lastId = null;
			testResult.report.forEach((testToken) => {
				if (testToken.id === 'SUITE_START' && !testToken.root)
				{
					if (lastId !== 'SUITE_START')
					{
						reportLines.push('');
					}

					indent++;
					reportLines.push(getIndent(indent) + `${chalk.bold(TASK_STATUS_ICON.pointerSmall)} ` + testToken.title);
				}

				if (testToken.id === 'SUITE_END' && !testToken.root)
				{
					indent--;
				}

				if (testToken.id === 'TEST_PENDING')
				{
					pendingCount++;
					reportLines.push(getIndent(indent) + '  ~ ' + testToken.title + chalk.gray(' (pending)'));
				}

				if (testToken.id === 'TEST_PASSED')
				{
					passedCount++;
					reportLines.push(getIndent(indent) + `  ${chalk.green(TASK_STATUS_ICON.success)} ` + testToken.title);
				}

				if (testToken.id === 'TEST_FAILED')
				{
					failedCount++;
					reportLines.push(getIndent(indent) + `  ${chalk.red(TASK_STATUS_ICON.fail)} ` + chalk.red(testToken.title));
					failedTests.push(testToken);
				}

				lastId = testToken.id;
			});

			if (failedTests.length > 0)
			{
				reportLines.push(`\n\n  ${chalk.bold('Failed tests:')}`);
				failedTests.forEach((testToken) => {
					reportLines.push(`    ${chalk.red(TASK_STATUS_ICON.fail)} ` + chalk.red(testToken.title));
					reportLines.push(`      ` + chalk.italic(testToken.error.message));
					reportLines.push(testToken.diff ?? '');
				});

				context.fail('Unit tests failed')
			}

			reportLines.push(chalk.bold('\n\n  Summary'));
			reportLines.push(`  Passed: ${passedCount}`);
			reportLines.push(`  Failed: ${failedCount}`);
			reportLines.push(`  Pending: ${pendingCount}`);
			reportLines.push(`  Total: ${passedCount + failedCount + pendingCount}`);

			reportLines.push('');
			const detailedReport = reportLines.join('\n');

			if (testResult.report.length === 0)
			{
				context.warn('No unit tests found');
			}
			else if (failedTests.length === 0)
			{
				context.succeed('Unit tests passed');
			}

			if (testResult.report.length > 0)
			{
				context.log(detailedReport);
			}

			return failedTests.length === 0;
		},
	};
}
