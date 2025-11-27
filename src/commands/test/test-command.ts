import chalk from 'chalk';
import { Command } from 'commander';
import { parseArgValue } from '../../utils/cli/parse-arg-value';
import { preparePath } from '../../utils/cli/prepare-path';
import { PackageFactoryProvider } from '../../modules/packages/providers/package-factory-provider';
import { findPackages } from '../../utils/package/find-packages';
import { testQueue } from './queue/test-queue';
import { TaskRunner } from '../../modules/task/task';
import { runUnitTestsTask } from './tasks/run.unit.tests.task';
import { runEndToEndTestsTask } from './tasks/run.e2e.tests.task';
import type { BasePackage } from '../../modules/packages/base-package';

export const testCommand = new Command('test');

testCommand
	.description('Run extension tests')
	.option('-w, --watch', 'Watch mode. Run tests by source changes')
	.option('-e, --extensions <extensions...>', 'Run test from specified extension', parseArgValue)
	.option('-m, --modules <modules...>', 'Run test from specified modules', parseArgValue)
	.option('-p, --path [path]', 'Run test from path', preparePath, process.cwd())
	.option('--headed', 'Run in headed mode')
	.option('--debug', 'Run in debug mode')
	.option('--grep <pattern>', 'Filter tests by pattern')
	.action((args): void => {
		const packageFactory = PackageFactoryProvider.create();
		const extensionsStream: NodeJS.ReadableStream = findPackages({
			startDirectory: args.startDirectory,
			packageFactory,
		});

		extensionsStream
			.on('data', ({ extension }: { extension: BasePackage }) => {
				void testQueue.add(async () => {
					const name = extension.getName();

					await TaskRunner.run([
						{
							title: chalk.bold(name),
							run: () => {
								return Promise.resolve();
							},
							subtasks: [
								runUnitTestsTask(extension, args),
								runEndToEndTestsTask(extension, args),
							],
						},
					]);
				});
			})
			.on('done', async ({ count }) => {
				await testQueue.onIdle();
				console.log(`\n✔ Complete! For all ${count} extensions`);
				process.exit(1);
			})
			.on('error', (err: Error) => {
				console.error('❌ Error while reading packages:', err);
				process.exit(1);
			});
	});
