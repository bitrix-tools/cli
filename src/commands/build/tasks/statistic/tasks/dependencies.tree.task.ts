import { flattenObjectKeys } from '../../../../../utils/flatten.object.keys';
import { generateTreeString } from '../../../../../utils/generate.tree';
import type { BasePackage } from '../../../../../modules/packages/base-package';
import type { Task } from '../../../../../modules/task/task';

export function dependenciesTreeTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Dependencies tree',
		run: async (context, { level, result }) => {
			const dependenciesTree = await extension.getDependenciesTree();
			context.succeed(`Dependencies tree (${flattenObjectKeys(dependenciesTree).length})`);
			context.log(generateTreeString(dependenciesTree, '    '));

			return {
				level,
				result,
			};
		},
	};
}
