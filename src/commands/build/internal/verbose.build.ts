import chalk from 'chalk';
import { TaskRunner } from '../../../modules/task/task';
import { BasePackage } from '../../../modules/packages/base-package';
import { lintTask } from '../tasks/lint/lint.task';
import { buildTask } from '../tasks/build/build.task';
import { runAfterBuildHooksTask } from '../tasks/hooks/run-after-build-hooks.task';

export function verboseBuild(extension: BasePackage, args: Record<string, any>): Promise<any>
{
	const name = extension.getName();

	return TaskRunner.run([
	{
		title: chalk.bold(name),
		run: () => {
			return Promise.resolve();
		},
		subtasks: [
			lintTask(extension, args),
			buildTask(extension, args),
			runAfterBuildHooksTask(extension, args),
		],
	}
]);
}
