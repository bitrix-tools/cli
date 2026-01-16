import { generateTreeString } from '../../../../../utils/generate.tree';
import type { BasePackage } from '../../../../../modules/packages/base-package';
import type { Task } from '../../../../../modules/task/task';
import chalk from 'chalk';

export function dependenciesTreeTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Dependencies tree',
		run: async (context) => {
			const dependenciesTree = await extension.getDependenciesTree({ size: true });
			const uniqueDependencies = await extension.getFlattedDependenciesTree();
			const allDependencies = await extension.getFlattedDependenciesTree(false);

			context.succeed(`Dependencies tree (${uniqueDependencies.length} (${chalk.grey(allDependencies.length)}))`);
			context.log(generateTreeString(dependenciesTree, '    '));
		},
	};
}
