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

					await TaskRunner.run([
						{
							title: chalk.bold(name),
							run: () => {
								return Promise.resolve();
							},
							subtasks: [
								buildTask(extension, args),
							],
						}
					]);
				});
			})
			.on('done', async ({ count }) => {
				await buildQueue.onIdle();
				console.log(`\n✔ Complete! For all ${count} extensions`);
			})
			.on('error', (err) => {
				console.error('❌ Error while reading packages:', err);
				process.exit(1);
			});
	});

export {
	buildCommand,
};


