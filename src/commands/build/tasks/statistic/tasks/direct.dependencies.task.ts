import { generateTreeString } from '../../../../../utils/generate.tree';
import { arrayToObject } from '../../../../../utils/array.to.object';
import type { BasePackage } from '../../../../../modules/packages/base-package';
import type { Task } from '../../../../../modules/task/task';

export function directDependenciesTask(extension: BasePackage, argv: Record<string, any>): Task
{
	return {
		title: 'Direct dependencies',
		run: async (context, { level, result }) => {
			context.succeed(`Direct dependencies (${result.externalDependenciesCount})`);
			context.log(generateTreeString(arrayToObject(await extension.getDependencies()), '    '));

			return {
				level,
				result,
			};
		},
	};
}
