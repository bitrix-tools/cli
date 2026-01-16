import chalk from 'chalk';
import { Command } from 'commander';

import { watchOption } from './options/watch-option';
import { extensionsOption } from './options/extensions-option';
import { modulesOption } from './options/modules-option';
import { pathOption } from './options/path-option';
import { verboseOption } from './options/verbose-option';
import { forceOption } from './options/force-option';
import { buildQueue } from './queue/build-queue';

import { PackageFactoryProvider } from '../../modules/packages/providers/package-factory-provider';
import { findPackages } from '../../utils/package/find-packages';

import { TaskRunner } from '../../modules/task/task';
import { buildTask } from './tasks/build/build.task';
import { lintTask } from './tasks/lint/lint.task';
import { runAfterBuildHooksTask } from './tasks/hooks/run-after-build-hooks.task';

import type { BasePackage } from '../../modules/packages/base-package';


const buildCommand = new Command('build');

buildCommand
	.description('Build JS extensions for Bitrix')
	.addOption(watchOption)
	.addOption(extensionsOption)
	.addOption(modulesOption)
	.addOption(pathOption)
	.addOption(verboseOption)
	.addOption(forceOption)
	.action(async (args) => {
		const packageFactory = PackageFactoryProvider.create();
		const extensionsStream: NodeJS.ReadableStream = findPackages({
			startDirectory: args.startDirectory,
			packageFactory,
		});

		extensionsStream
			.on('data', ({ extension }: { extension: BasePackage }) => {
				buildQueue.add(async () => {
					const name = extension.getName();

					if (args.verbose)
					{
						return await TaskRunner.run([
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

					await TaskRunner.runTask({
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
								});
							}

							if (result.warnings.length > 0)
							{
								context.warn(chalk.bold(name));

								result.warnings.forEach((error) => {
									context.border(error.message, 'yellow', 2);
								});
							}
						},
					});
				});
			})
			.on('done', async ({ count }) => {
				await buildQueue.onIdle();
				if (count > 1)
				{
					console.log(`\n✔ Complete! For all ${count} extensions`);
				}
			})
			.on('error', (err) => {
				console.error('❌ Error while reading packages:', err);
				process.exit(1);
			});
	});

export {
	buildCommand,
};


