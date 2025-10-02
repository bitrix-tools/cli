import { formatSize } from '../../../utils/format.size';
import {TASK_STATUS_ICON} from '../../../modules/task/icons';

import type { BasePackage } from '../../../modules/packages/base-package';
import type { Task } from '../../../modules/task/task';

export function bundleSizeTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Bundle size',
		run: async (context) => {
			context.succeed('Bundle size');
			const sizes = extension.getBundlesSize();

			const formattedJsSize = formatSize({
				size: sizes.js,
			});

			const formattedCssSize = formatSize({
				size: sizes.css,
			});

			const formattedTotalSize = formatSize({
				size: sizes.js + sizes.css,
			});

			context.log(`    ${TASK_STATUS_ICON.arrowRight} JS: ${formattedJsSize}`);
			context.log(`    ${TASK_STATUS_ICON.arrowRight} CSS: ${formattedCssSize}`);
			context.log(`    ${TASK_STATUS_ICON.arrowRight} Total size: ${formattedTotalSize}`);
		},
	};
}
