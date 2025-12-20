import chalk from 'chalk';
import { Command } from 'commander';

import { PackageFactoryProvider } from '../../modules/packages/providers/package-factory-provider';
import { findPackages } from '../../utils/package/find-packages';
import { pathOption } from '../build/options/path-option';
import { convertQueue } from './queue/convert-queue';
import { TaskContext, TaskRunner } from '../../modules/task/task';

import { renameFileTask } from './tasks/rename-file.task';
import { BundleConfigManager } from '../../modules/config/bundle/bundle.config.manager';
import { convertFlowSyntaxTask } from './tasks/convert-flow-syntax.task';

import type { BasePackage } from '../../modules/packages/base-package';

export const flowToTsCommand = new Command('flow-to-ts');

flowToTsCommand
	.description('Migrate flow to ts')
	.addOption(pathOption)
	.option('--rm-ts', 'Remove TS source files', false)
	.option('--rm-js', 'Remove JS source files', false)
	.action((args): void => {
		const packageFactory = PackageFactoryProvider.create();
		const extensionsStream: NodeJS.ReadableStream = findPackages({
			startDirectory: args.path,
			packageFactory,
		});

		extensionsStream
			.on('data', async ({ extension }: { extension: BasePackage }) => {
				void convertQueue.add(async () => {
					const sourceFiles = extension.getActualSourceFiles();
					if (sourceFiles.length === 0)
					{
						console.log('Source JS files don\'t exist.');
					}

					await TaskRunner.run([
						{
							title: chalk.bold(`Migrate ${extension.getName()} to TypeScript`),
							run: async () => {
								return Promise.resolve();
							},
							subtasks: [
								{
									title: 'Rename source files with `hg rename`',
									run: async () => {
										return Promise.resolve();
									},
									subtasks: sourceFiles.map((filePath: string) => {
										return renameFileTask(extension, filePath);
									}),
								},
								{
									title: 'Convert Flow.js syntax to TypeScript syntax',
									run: async () => {
										return Promise.resolve();
									},
									subtasks: sourceFiles.map((filePath: string) => {
										return convertFlowSyntaxTask(extension, filePath.replace(/\.js$/, '.ts'));
									}),
								},
								{
									title: 'Update bundle.config.js',
									run: async (context: TaskContext) => {
										return Promise.resolve();
									},
									subtasks: [
										{
											title: 'Change entry point...',
											run: async (context: TaskContext) => {
												const bundleConfig: BundleConfigManager = extension.getBundleConfig();
												const input = bundleConfig.get('input');

												if (typeof input === 'string')
												{
													const tsEntryPoint = input.replace(/\.js$/, '.ts');
													bundleConfig.set('input', tsEntryPoint);

													await bundleConfig.save(extension.getBundleConfigFilePath());

													context.succeed(`Entry point changed to ${tsEntryPoint}`);
												}
												else
												{
													context.warn(`Entry point not set`);
												}
											},
										},
									],
								},
							],
						}
					]);
				});
			})
			.on('done', async ({ count }) => {
				await convertQueue.onIdle();
				process.exit(1);
			})
			.on('error', (err: Error) => {
				console.error('❌ Error while reading packages:', err);
				process.exit(1);
			});
	});
