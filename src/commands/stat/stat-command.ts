import { Command } from 'commander';
import ora from 'ora';
import { extensionsOption } from './options/extensions-option';
import { modulesOptions } from './options/modules-options';
import { pathOption } from './options/path-option';
import { statQueue } from './queue/stat-queue';
import { findPackages } from '../../utils/package/find-packages';
import { PackageFactory } from '../../modules/package-factory';
import { Environment } from '../../environment/environment';
import { sourceStrategies } from '../../modules/strategies/source';
import { projectStrategies } from '../../modules/strategies/project';
import { defaultStrategy } from '../../modules/strategies/default-strategy';

const statCommand = new Command('stat');

statCommand
	.description('Display statistics for Bitrix extensions.')
	.addOption(extensionsOption)
	.addOption(modulesOptions)
	.addOption(pathOption)
	.action(async (options) => {
		const extensionsStream: NodeJS.ReadableStream = findPackages({
			startDirectory: options.path,
			packageFactory: new PackageFactory({
				strategies: Environment.getType() === 'source' ? sourceStrategies : projectStrategies,
				defaultStrategy: defaultStrategy,
			})
		});

		const spinner = ora('Collecting statistics... 0/∞').start();

		extensionsStream
			.on('data', ({ extensionName, count }) => {
				spinner.text = `Collecting statistics... ${count}/∞`;
			})
			.on('done', ({ count }) => {
				spinner.succeed(`Statistics collected successfully.`);
				console.log('\n📊 Statistics:');
				console.log(`Total extensions: ${count}`);
			});
	});

export {
	statCommand,
};


