import { generateTreeString } from '../../../utils/generate.tree';
import type { BasePackage } from '../../../modules/packages/base-package';
import type { Task } from '../../../modules/task/task';

export function directDependenciesTask(extension: BasePackage, argv: Record<string, any>): Task
{
	return {
		title: 'Direct dependencies',
		run: async (context) => {
			const dependencies = await extension.getDependencies();
			context.succeed(`Direct dependencies (${dependencies.length})`);
			context.log(generateTreeString(await extension.getDependencies(), '    '));
		},
	};
}
