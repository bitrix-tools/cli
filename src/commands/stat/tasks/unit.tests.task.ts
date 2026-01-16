import type { BasePackage } from '../../../modules/packages/base-package';
import type { Task } from '../../../modules/task/task';

export function unitTestsTask(extension: BasePackage): Task
{
	return {
		title: 'Run unit tests...',
		run: async (context) => {
			const testsResult = await extension.runUnitTests();
			if (testsResult.errors.length > 0)
			{
				context.fail(`Run unit tests failed --> Run bitrix test -e=${extension.getName()} for more information`);
			}
			else
			{
				const stats = testsResult.report.reduce((acc, item) => {
					if (item.id === 'TEST_PASSED')
					{
						acc.passed++;
					}

					if (item.id === 'TEST_FAILED')
					{
						acc.failed++;
					}

					return acc;
				}, { passed: 0, failed: 0 });

				if (stats.passed === 0 && stats.failed === 0)
				{
					context.warn('No unit tests found');
				}

				if (stats.passed > 0 && stats.failed === 0)
				{
					context.succeed('Unit tests passed');
				}

				if (stats.failed > 0)
				{
					context.fail(`Unit tests failed --> Run bitrix test -e=${extension.getName()} for more information.`);
				}
			}
		},
	};
}
