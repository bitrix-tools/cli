import { formatSize } from '../../../utils/format.size';
import type { BasePackage } from '../../../modules/packages/base-package';
import type { Task } from '../../../modules/task/task';
import {TASK_STATUS_ICON} from '../../../modules/task/icons';

export function totalTransferredSizeTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Total transferred size',
		run: async (context) => {
			const totalTransferredSize = await extension.getTotalTransferredSize();
			context.succeed('Total transferred size');

			const formattedJsSize = formatSize({
				size: totalTransferredSize.js,
			});

			const formattedCssSize = formatSize({
				size: totalTransferredSize.css,
			});

			context.log(`    ${TASK_STATUS_ICON.arrowRight} JS: ${formattedJsSize}`);
			context.log(`    ${TASK_STATUS_ICON.arrowRight} CSS: ${formattedCssSize}`);
		},
	};
}
