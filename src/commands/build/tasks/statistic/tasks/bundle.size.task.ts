import { formatSize } from '../../../../../utils/format.size';
import {TASK_STATUS_ICON} from '../../../../../modules/task/icons';

import type { BasePackage } from '../../../../../modules/packages/base-package';
import type { Task } from '../../../../../modules/task/task';

export function bundleSizeTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Bundle size',
		run: async (context, { level, result }) => {
			context.succeed('Bundle size');

			let totalSize = 0;
			result.bundles.forEach((bundle) => {
				totalSize += bundle.size;
				const formattedSize = formatSize({
					size: bundle.size,
				});

				context.log(`    ${TASK_STATUS_ICON.arrowRight} ${bundle.fileName}: ${formattedSize}`);
			});

			const formattedTotalSize = formatSize({
				size: totalSize,
			});

			context.log(`    ${TASK_STATUS_ICON.arrowRight} Total size: ${formattedTotalSize}`);

			return {
				level,
				result,
			};
		},
	};
}
