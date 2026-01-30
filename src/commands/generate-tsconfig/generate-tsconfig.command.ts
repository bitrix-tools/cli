import chalk from 'chalk';
import * as fs from 'node:fs';
import * as path from 'path';
import { Command } from 'commander';

import { PackageFactoryProvider } from '../../modules/packages/providers/package-factory-provider';
import { findPackages } from '../../utils/package/find-packages';
import { FlexibleCompilerOptions } from '@rollup/plugin-typescript';
import { Environment } from '../../environment/environment';
import { pathOption } from '../build/options/path-option';

import type { BasePackage } from '../../modules/packages/base-package';

export const generateTsconfigCommand = new Command('generate-tsconfig');

generateTsconfigCommand
	.description('Generate tsconfig.json')
	.addOption(pathOption)
	.action((args): void => {
		const packageFactory = PackageFactoryProvider.create();
		const extensionsStream: NodeJS.ReadableStream = findPackages({
			startDirectory: Environment.getRoot(),
			packageFactory,
		});

		const tsconfig: FlexibleCompilerOptions = {
			compilerOptions: {
				baseUrl: Environment.getRoot(),
				paths: {},
			},
		};

		let aliasesCount = 0;

		extensionsStream
			.on('data', ({ extension }: { extension: BasePackage }) => {
				if (/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(extension.getName()))
				{
					const relativePath = path.relative(Environment.getRoot(), extension.getInputPath());
					tsconfig.compilerOptions.paths[extension.getName()] = [`./${relativePath}`];

					console.log(`Alias created for: ${extension.getName()}`);

					aliasesCount++;
				}
			})
			.on('done', async () => {
				fs.writeFileSync(
					path.join(Environment.getRoot(), 'aliases.tsconfig.json'),
					JSON.stringify(tsconfig, null, 4),
				);

				console.log(`\n${chalk.green('✔')} aliases.tsconfig.json generated successfully with ${aliasesCount} aliases\n`);
				process.exit(0);
			})
			.on('error', (err: Error) => {
				console.error('❌ Error while reading packages:', err);
				process.exit(1);
			});
	});
