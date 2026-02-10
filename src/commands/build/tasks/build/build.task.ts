import chalk from 'chalk';
import type { Task } from '../../../../modules/task/task';
import type { BasePackage } from '../../../../modules/packages/base-package';
import {directDependenciesTask} from '../statistic/tasks/direct.dependencies.task';
import {dependenciesTreeTask} from '../statistic/tasks/dependencies.tree.task';
import {bundleSizeTask} from '../statistic/tasks/bundle.size.task';
import {totalTransferredSizeTask} from '../statistic/tasks/total.transferred.size.task';

export function buildTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Building code...',
		run: async (context) => {
			const result = await extension.build();

			if (result.errors.length === 0 && result.warnings.length === 0)
			{
				context.succeed('Build successfully');
			}

			if (result.errors.length > 0)
			{
				context.fail('Build failed');
				result.errors.forEach((error) => {
					context.border(error.message, 'red', 2);
					if (error.frame)
					{
						context.border(error?.frame, 'red', 2);
					}
				});
			}

			if (result.warnings.length > 0)
			{
				context.warn('Build with issues');
				result.warnings.forEach((error) => {
					context.border(error.message, 'yellow', 2);
					if (error.frame)
					{
						context.border(error?.frame, 'yellow', 2);
					}
				});
			}
		},
		subtasks: [
			bundleSizeTask(extension, args),
			totalTransferredSizeTask(extension, args),
			directDependenciesTask(extension, args),
			dependenciesTreeTask(extension, args),
		],
	};
}
