import { formatSize } from '../../../../utils/format.size';
import type { Task } from '../../../../modules/task/task';
import type { BasePackage } from '../../../../modules/packages/base-package';
import {directDependenciesTask} from './tasks/direct.dependencies.task';
import {dependenciesTreeTask} from './tasks/dependencies.tree.task';
import {bundleSizeTask} from './tasks/bundle.size.task';
import {totalTransferredSizeTask} from './tasks/total.transferred.size.task';

export function statisticTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Make build statistics...',
		run: async (context, { level, result }) => {
			context.succeed('Build statistics');

			return {
				level,
				result,
			};
		},
		subtasks: [
			directDependenciesTask(extension, args),
			dependenciesTreeTask(extension, args),
			bundleSizeTask(extension, args),
			totalTransferredSizeTask(extension, args),
		],
	};
}
