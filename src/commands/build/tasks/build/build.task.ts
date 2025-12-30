import chalk from 'chalk';
import type { Task } from '../../../../modules/task/task';
import type { BasePackage } from '../../../../modules/packages/base-package';

export function buildTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Building code...',
		run: async (context) => {
			const result = await extension.build();

			if (result.errors.length === 0 && result.warnings.length === 0)
			{
				context.succeed('Build successfully');
			}

			if (result.errors.length > 0)
			{
				context.fail('Build failed');
				result.errors.forEach((error) => {
					context.log(`    ${chalk.red('✖')} ${error.message}`);
				});
			}

			if (result.warnings.length > 0)
			{
				context.warn('Build with issues');
				result.warnings.forEach((error) => {
					context.log(`    ${chalk.yellow('⚠')} ${error.message}`);
				});
			}
		},
	};
}
