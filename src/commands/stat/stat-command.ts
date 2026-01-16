import { Command } from 'commander';
import { extensionsOption } from './options/extensions-option';
import { modulesOptions } from './options/modules-options';
import { pathOption } from './options/path-option';
import { statQueue } from './queue/stat-queue';
import { findPackages } from '../../utils/package/find-packages';
import { PackageFactory } from '../../modules/packages/package-factory';
import { Environment } from '../../environment/environment';
import { sourceStrategies } from '../../modules/packages/strategies/source';
import { projectStrategies } from '../../modules/packages/strategies/project';
import { defaultStrategy } from '../../modules/packages/strategies/default-strategy';
import { TaskRunner } from '../../modules/task/task';
import chalk from 'chalk';
import { directDependenciesTask } from './tasks/direct.dependencies.task';
import { dependenciesTreeTask } from './tasks/dependencies.tree.task';
import { bundleSizeTask } from './tasks/bundle.size.task';
import { totalTransferredSizeTask } from './tasks/total.transferred.size.task';
import { unitTestsTask } from './tasks/unit.tests.task';
import { e2eTestsTask } from './tasks/e2e.tests.task';
import { tryBuildTask } from './tasks/try.build.task';

const statCommand = new Command('stat');

statCommand
	.description('Display statistics for Bitrix extensions.')
	.addOption(extensionsOption)
	.addOption(modulesOptions)
	.addOption(pathOption)
	.action(async (args) => {
		const extensionsStream: NodeJS.ReadableStream = findPackages({
			startDirectory: args.path,
			packageFactory: new PackageFactory({
				strategies: Environment.getType() === 'source' ? sourceStrategies : projectStrategies,
				defaultStrategy: defaultStrategy,
			})
		});

		extensionsStream
			.on('data', ({ extension, count }) => {
				statQueue.add(async () => {
					const name = extension.getName();

					await TaskRunner.run([
						{
							title: chalk.bold(name),
							run: () => {
								return Promise.resolve();
							},
							subtasks: [
								tryBuildTask(extension),
								unitTestsTask(extension),
								e2eTestsTask(extension),
								directDependenciesTask(extension, args),
								dependenciesTreeTask(extension, args),
								bundleSizeTask(extension, args),
								totalTransferredSizeTask(extension),
							],
						},
					]);
				});
			})
			.on('done', async ({ count }) => {
				await statQueue.onIdle();
				process.exit(0);
				// console.log('\n📊 Statistics:');
				// console.log(`Total extensions: ${count}`);
			});
	});

export {
	statCommand,
};


