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
import { createShutdown } from '../../utils/create.shutdown';

import { build } from './internal/build';

import type { FSWatcher } from 'chokidar';
import type { BasePackage } from '../../modules/packages/base-package';
import chalk from 'chalk';


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

		const watchers: Array<FSWatcher> = [];

		extensionsStream
			.on('data', async ({ extension }: { extension: BasePackage }) => {
				if (args.watch)
				{
					await buildQueue.add(async () => {
						const chokidar = await import('chokidar');
						const watcher = chokidar.watch(
							extension.getSourceDirectoryPath(),
						);

						watchers.push(watcher);

						watcher.on('change', async () => {
							await buildQueue.add(
								build(extension, args),
							);
						});
					});
				}

				await buildQueue.add(
					build(extension, args),
				);
			})
			.on('done', async ({ count }) => {
				await buildQueue.onIdle();

				if (args.watch)
				{
					if (count === 1)
					{
						console.log(`\n${chalk.green('✔')} Watcher started`);
					}
					else
					{
						console.log(`\n${chalk.green('✔')} Watcher started for ${count} extensions`);
					}
				}
				else
				{
					if (count > 1)
					{
						console.log(`\n${chalk.green('✔')} Build ${count} extensions successfully`);
					}

					process.exit(0);
				}
			})
			.on('error', (err) => {
				console.error('❌ Error while reading packages:', err);
				process.exit(1);
			});

		if (args.watch)
		{
			const shutdown = createShutdown(async () => {
				console.log('\n🛑 Watcher stopped...');

				for await (const watcher of watchers)
				{
					await watcher.close();
				}

				await buildQueue.onIdle();

				console.log('👋 Goodbye!');
			});

			process.on('SIGINT', shutdown);
			process.on('SIGTERM', shutdown);
			process.on('SIGTSTP', shutdown);
		}
	});

export {
	buildCommand,
};


