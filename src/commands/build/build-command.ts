import { Command } from 'commander';
import { watchOption } from './options/watch-option';
import { extensionsOption } from './options/extensions-option';
import { modulesOptions } from './options/modules-options';
import { pathOption } from './options/path-option';
import { verboseOption } from './options/verbose-option';
import { forceOption } from './options/force-option';
import { buildQueue } from './queue/build-queue';
import { findPackages } from '../../utils/package/find-packages';
import { PackageFactoryProvider } from '../../modules/packages/providers/package-factory-provider';
import { BasePackage } from '../../modules/packages/base-package';
import { TaskRunner } from '../../modules/task/task';
import { formatSize } from '../../utils/format.size';
import { TASK_STATUS_ICON } from '../../modules/task/icons';
import { summaryFormatter } from '../../modules/formatters/lint/summary.formatter';
import { verboseFormatter } from '../../modules/formatters/lint/verbose.formatter';
import {generateTreeString} from '../../utils/generate.tree';
import chalk from 'chalk';
import {arrayToObject} from '../../utils/array.to.object';
import {flattenObjectKeys} from '../../utils/flatten.object.keys';


const buildCommand = new Command('build');

buildCommand
	.description('Build JS extensions for Bitrix')
	.addOption(watchOption)
	.addOption(extensionsOption)
	.addOption(modulesOptions)
	.addOption(pathOption)
	.addOption(verboseOption)
	.addOption(forceOption)
	.action(async ({ path: startDirectory, verbose, force }) => {
		const packageFactory = PackageFactoryProvider.create();
		const extensionsStream: NodeJS.ReadableStream = findPackages({
			startDirectory,
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
								{
									title: 'ESLint analysis...',
									run: async (context) => {
										const result = await extension.lint();
										const { text, title, level } = await (async () => {
											if (verbose)
											{
												const verboseResult = await verboseFormatter(result);
												const summaryResult = await summaryFormatter(result);

												return {
													level: verboseResult.level,
													text: verboseResult.text,
													title: summaryResult.title,
												};
											}

											return await summaryFormatter(result);
										})();

										context[level](title);
										if (text.length > 0)
										{
											context.log(text);
										}

										return {
											level,
										};
									},
								},
								{
									title: 'Building code...',
									run: async (context, { level }) => {
										if (level === 'fail' && !force)
										{
											context.fail('Build failed');
											return;
										}

										const result = await extension.build();
										if (level === 'succeed')
										{
											context.succeed('Build success');
										}
										else
										{
											context.warn('Build with issues');
										}

										return {
											level,
											result,
										};
									},
								},
								{
									title: 'Make build report...',
									run: async (context, { level, result }) => {
										context.succeed('Build report');

										return {
											level,
											result,
										};
									},
									subtasks: [
										{
											title: 'Direct dependencies',
											run: async (context, { level, result }) => {
												context.succeed(`Direct dependencies (${result.externalDependenciesCount})`);
												context.log(generateTreeString(arrayToObject(await extension.getDependencies()), '    '));

												return {
													level,
													result,
												};
											},
										},
										{
											title: 'Dependencies tree',
											run: async (context, { level, result }) => {
												const dependenciesTree = await extension.getDependenciesTree();
												context.succeed(`Dependencies tree (${flattenObjectKeys(dependenciesTree).length})`);
												context.log(generateTreeString(dependenciesTree, '    '));

												return {
													level,
													result,
												};
											},
										},
										{
											title: 'Bundle size',
											run: async (context, { level, result }) => {
												context.succeed('Bundle size');

												let totalSize = 0;
												result.bundles.forEach((bundle) => {
													totalSize += bundle.size;
													context.log(`    ${TASK_STATUS_ICON.arrowRight} ${bundle.fileName}: ${formatSize(bundle.size)}`);
												});

												context.log(`    ${TASK_STATUS_ICON.arrowRight} Total size: ${formatSize(totalSize)}`);

												return {
													level,
													result,
												};
											},
										},
										{
											title: 'Total transferred size',
											run: async (context, { level, result }) => {
												const totalTransferredSize = await extension.getTotalTransferredSize();
												context.succeed('Total transferred size');
												context.log(`    JS: ${formatSize(totalTransferredSize.js)}, CSS: ${formatSize(totalTransferredSize.css)}`);
											},
										},
									],
								}
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


