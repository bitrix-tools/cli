import { formatSize } from '../../../../../utils/format.size';
import type { BasePackage } from '../../../../../modules/packages/base-package';
import type { Task } from '../../../../../modules/task/task';

export function totalTransferredSizeTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Total transferred size',
		run: async (context, { level, result }) => {
			const totalTransferredSize = await extension.getTotalTransferredSize();
			context.succeed('Total transferred size');
			context.log(`    JS: ${formatSize(totalTransferredSize.js)}, CSS: ${formatSize(totalTransferredSize.css)}`);

			return {
				level,
				result,
			};
		},
	};
}
