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

			const bundleSize = extension.getBundlesSize();

			if (bundleSize.js > 0)
			{
				const formattedJsSize = formatSize({
					size: bundleSize.js,
				});
				context.log(`    ${TASK_STATUS_ICON.arrowRight} JS: ${formattedJsSize}`);
			}

			if (bundleSize.css > 0)
			{
				const formattedCssSize = formatSize({
					size: bundleSize.css,
				});
				context.log(`    ${TASK_STATUS_ICON.arrowRight} CSS: ${formattedCssSize}`);
			}

			if (bundleSize.js > 0 && bundleSize.css > 0)
			{
				const formattedTotalSize = formatSize({
					size: bundleSize.js + bundleSize.css,
				});

				context.log(`    ${TASK_STATUS_ICON.arrowRight} Total size: ${formattedTotalSize}`);
			}
		},
	};
}
