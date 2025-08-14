import { Command } from 'commander';
import ora from 'ora';
import { watchOption } from './options/watch-option';
import { extensionsOption } from './options/extensions-option';
import { modulesOptions } from './options/modules-options';
import { pathOption } from './options/path-option';
import { buildQueue } from './queue/build-queue';
import { findPackages } from '../../utils/package/find-packages';
import { PackageFactoryProvider } from '../../modules/providers/package-factory-provider';

const buildCommand = new Command('build');

buildCommand
	.description('Build JS extensions for Bitrix')
	.addOption(watchOption)
	.addOption(extensionsOption)
	.addOption(modulesOptions)
	.addOption(pathOption)
	.action(async ({ path: startDirectory }) => {
		const packageFactory = PackageFactoryProvider.create();
		const extensionsStream: NodeJS.ReadableStream = findPackages({
			startDirectory,
			packageFactory,
		});

		extensionsStream
			.on('data', ({ extension }) => {
				buildQueue.add(async () => {
					const name = extension.getName();
					const spinner = ora().start(`Build ${name}`);

					try
					{
						await extension.build();
						spinner.succeed(`Built ${name}`);
					}
					catch (error)
					{
						spinner.fail(`Failed to build ${name}`);
						throw error;
					}
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


