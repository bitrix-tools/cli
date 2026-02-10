import chalk from 'chalk';
import { TaskRunner } from '../../../modules/task/task';
import { BasePackage } from '../../../modules/packages/base-package';

export function plainBuild(extension: BasePackage, args: Record<string, any>): Promise<any>
{
	const name = extension.getName();

	return TaskRunner.runTask({
		title: chalk.bold(name),
		run: async (context) => {
			const result = await extension.build();
			if (result.errors.length === 0 && result.warnings.length === 0)
			{
				context.succeed(chalk.bold(name));
			}

			if (result.errors.length > 0)
			{
				context.fail(chalk.bold(name));

				result.errors.forEach((error) => {
					context.border(error.message, 'red', 2);
					if (error.frame)
					{
						context.border(error?.frame, 'red', 2);
					}
				});
			}

			if (result.warnings.length > 0)
			{
				context.warn(chalk.bold(name));

				result.warnings.forEach((error) => {
					context.border(error.message, 'yellow', 2);
					if (error.frame)
					{
						context.border(error?.frame, 'yellow', 2);
					}
				});
			}
		},
	});
}
