import { Command } from 'commander';
import { PackageFactoryProvider } from '../../modules/packages/providers/package-factory-provider';
import { findPackages } from '../../utils/package/find-packages';
import type { BasePackage } from '../../modules/packages/base-package';
import { FlexibleCompilerOptions } from '@rollup/plugin-typescript';
import * as fs from 'node:fs';
import * as path from 'path';
import { Environment } from '../../environment/environment';
import { pathOption } from '../build/options/path-option';

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
				module: 'ESNext',
				target: 'ESNext',
				allowJs: true,
				checkJs: false,
				strict: true,
				lib: ['ESNext', 'DOM'],
				baseUrl: Environment.getRoot(),
				paths: {},
			},
		};

		let totalCount = 0;

		extensionsStream
			.on('data', ({ extension }: { extension: BasePackage }) => {
				if (/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(extension.getName()))
				{
					const relativePath = path.relative(Environment.getRoot(), extension.getInputPath());
					tsconfig.compilerOptions.paths[extension.getName()] = [`./${relativePath}`];

					console.log(`${extension.getName()} processed`);

					totalCount++;
				}
			})
			.on('done', async ({ count }) => {
				fs.writeFileSync(
					path.join(Environment.getRoot(), 'tsconfig.json'),
					JSON.stringify(tsconfig, null, 4),
				);

				console.log(`\n✔ tsconfig.json generated successfully. Added ${totalCount} aliases\n`);
				process.exit(1);
			})
			.on('error', (err: Error) => {
				console.error('❌ Error while reading packages:', err);
				process.exit(1);
			});
	});
