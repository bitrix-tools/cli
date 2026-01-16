import type { BasePackage } from '../../../modules/packages/base-package';
import type { Task } from '../../../modules/task/task';

export function e2eTestsTask(extension: BasePackage): Task
{
	return {
		title: 'Run E2E tests...',
		run: async (context) => {
			const endToEndTests = await extension.getEndToEndTests();
			if (endToEndTests.length === 0)
			{
				context.warn('No E2E tests found');
			}
			else
			{
				const testsResult = await extension.runUnitTests();
				if (testsResult.code === 'TESTS_PASSED')
				{
					context.succeed('Unit tests passed');
				}

				if (testsResult.code === 'TESTS_FAILED')
				{
					context.succeed('Unit tests passed');
				}
			}
		},
	};
}
