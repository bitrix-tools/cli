import type { BasePackage } from '../../../modules/packages/base-package';
import type { Task } from '../../../modules/task/task';

export function tryBuildTask(extension: BasePackage): Task
{
	return {
		title: 'Find build errors...',
		run: async (context) => {
			const buildResult = await extension.generate();
			if (buildResult.errors.length === 0 && buildResult.warnings.length === 0)
			{
				context.succeed('No build issues found');
			}

			if (buildResult.errors.length > 0)
			{
				context.fail(`Has build errors --> Run bitrix build -e=${extension.getName()} for more information`);
			}

			if (buildResult.warnings.length > 0 && buildResult.errors.length === 0)
			{
				context.warn(`Has build warnings --> Run bitrix build -e=${extension.getName()} for more information`);
			}
		},
	};
}
