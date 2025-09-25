import type { Task } from '../../../../modules/task/task';
import type { BasePackage } from '../../../../modules/packages/base-package';
import chalk from 'chalk';

export function buildTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Building code...',
		run: async (context, { level }) => {
			if (level === 'fail' && !args.force)
			{
				context.fail('Build failed');
				return {
					level,
				};
			}

			const result = await extension.build();
			if (level === 'succeed')
			{
				context.succeed('Build success');
			}
			else
			{
				context.warn('Build with issues');

				if (result.errors.length > 0)
				{
					result.errors.forEach((error) => {
						context.log(`    ${chalk.red('✖')} ${error.message}`);
					});
				}

				if (result.warnings.length > 0)
				{
					result.warnings.forEach((error) => {
						context.log(`    ${chalk.yellow('⚠')} ${error.message}`);
					});
				}
			}

			return {
				level,
				result,
			};
		},
	};
}
