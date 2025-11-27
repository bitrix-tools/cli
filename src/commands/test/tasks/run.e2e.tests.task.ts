import type { BasePackage } from '../../../modules/packages/base-package';
import type { Task } from '../../../modules/task/task';

export function runEndToEndTestsTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'E2E tests',
		run: async (context): Promise<any> => {
			const { status } = await extension.runEndToEndTests(args);

			if (status === 'NO_TESTS_FOUND')
			{
				context.warn('No E2E tests found');
			}
			else if (status === 'TESTS_FAILED')
			{
				context.fail('E2E tests failed');
			}
			else
			{
				context.succeed('E2E tests passed');
			}
		},
	};
}
