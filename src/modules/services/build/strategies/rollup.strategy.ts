import path from 'node:path';

import {
	rollup,
	type InputOptions,
	type OutputOptions,
	type RollupLog,
	type Plugin,
	type RollupBuild,
	type RollupOutput,
	type WarningHandlerWithDefault,
	type OutputChunk,
} from 'rollup';

import type { ParsedCommandLine } from 'typescript';

import nodeResolve from '@rollup/plugin-node-resolve';
import babelPlugin from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';
import imagePlugin from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';

import presetEnv from '@babel/preset-env';
import flowStripTypesPlugin from '@babel/plugin-transform-flow-strip-types';
import externalHelpersPlugin from '@babel/plugin-external-helpers';

import { Environment } from '../../../../environment/environment';
import { PackageResolver } from '../../../packages/package.resolver';
import { isExternalDependencyName } from '../../../../utils/is.external.dependency.name';
import { BuildStrategy } from './build.strategy';
import { FileFinder } from '../../../../utils/file.finder';
import concatPlugin from './rollup/plugin/concat-plugin';

import type {
	BuildResult,
	BuildOptions,
	BundleFileInfo,
	BuildCodeOptions,
	BuildCodeResult,
} from '../types/build.service.types';


export class RollupBuildStrategy extends BuildStrategy
{
	protected static calculateBundlesSize(output: RollupOutput['output']): BundleFileInfo[]
	{
		return output.map((chunk) => {
			const code = chunk.type === 'asset' ? chunk.source : chunk.code;
			const size = Buffer.byteLength(code, 'utf8');

			return {
				fileName: chunk.fileName,
				size,
			};
		});
	}

	protected static makeGlobals(dependencies: string[]): Record<string, string>
	{
		return dependencies.reduce((acc, dependency: string) => {
			const extension = PackageResolver.resolve(dependency);
			if (extension)
			{
				return { ...acc, ...extension.getGlobal() };
			}

			return acc;
		}, {})
	}

	protected static createOnWarningHandler(): {
		warningsRef: RollupLog[],
		dependenciesRef: string[],
		onWarning: WarningHandlerWithDefault,
	}
	{
		const warningsRef: Array<RollupLog> = [];
		const dependenciesRef: Array<string> = [];
		const onWarning = (warning: RollupLog): void => {
			if (
				warning.code === 'UNRESOLVED_IMPORT'
				&& isExternalDependencyName(warning.exporter)
			)
			{
				dependenciesRef.push(warning.exporter);

				return;
			}

			warningsRef.push(warning);
		};

		return {
			warningsRef,
			dependenciesRef,
			onWarning,
		};
	}

	protected static createVirtualEntryPlugin(entries: Record<string, string>): Plugin
	{
		return {
			name: 'virtual-module-plugin',
			resolveId(id) {
				if (id in entries)
				{
					return id;
				}

				return null;
			},
			load(id) {
				if (id in entries)
				{
					return entries[id];
				}

				return null;
			},
		}
	}

	protected static createStandalonePlugin(): Plugin
	{
		return {
			name: 'standalone-plugin',
			resolveId(id) {
				const extension = PackageResolver.resolve(id);
				if (extension)
				{
					return extension.getInputPath();
				}

				return null;
			},
		}
	}

	async build(options: BuildOptions): Promise<BuildResult>
	{
		const { onWarning, warningsRef, dependenciesRef } = RollupBuildStrategy.createOnWarningHandler();
		const inputOptions: InputOptions = await this.#buildRollupInputOptions(options, onWarning);

		let bundle: RollupBuild;
		try
		{
			bundle = await rollup(inputOptions);
		}
		catch (error)
		{
			console.error(error);
			return {
				dependencies: [],
				bundles: [],
				warnings: [],
				errors: [error],
				standalone: options.standalone ?? false,
			};
		}

		const outputOptions: OutputOptions = this.#buildRollupOutputOptions(options);
		const globals = RollupBuildStrategy.makeGlobals(dependenciesRef);

		let result: RollupOutput;
		try
		{
			result = await bundle.write({ ...outputOptions, globals })
		}
		catch (error)
		{
			return {
				dependencies: [],
				bundles: [],
				warnings: [],
				errors: [error],
				standalone: options.standalone ?? false,
			};
		}

		await bundle.close();

		const bundlesSize = RollupBuildStrategy.calculateBundlesSize(result.output);
		const sortedDependencies = RollupBuildStrategy.sortDependencies(dependenciesRef)

		return {
			dependencies: sortedDependencies,
			bundles: bundlesSize,
			warnings: [...warningsRef],
			errors: [],
			standalone: options.standalone ?? false,
		};
	}

	async buildCode(options: BuildCodeOptions): Promise<BuildCodeResult>
	{
		const { onWarning, warningsRef, dependenciesRef } = RollupBuildStrategy.createOnWarningHandler();
		const rollupInputOptions: InputOptions = await this.#buildRollupBuildCodeInputOptions(
			options,
			onWarning,
		);

		const bundle: RollupBuild = await rollup(rollupInputOptions);

		const outputOptions: OutputOptions = this.#buildRollupBuildCodeOutputOptions(options);

		const globals = RollupBuildStrategy.makeGlobals(dependenciesRef);
		const result: RollupOutput = await bundle.generate({ ...outputOptions, globals });

		await bundle.close();

		const outputEntry = result.output.at(0) as OutputChunk;

		return {
			code: outputEntry?.code,
			dependencies: [...dependenciesRef],
			warnings: [...warningsRef],
			errors: [],
		};
	}

	async generate(options: BuildOptions): Promise<BuildResult>
	{
		const { onWarning, warningsRef, dependenciesRef } = RollupBuildStrategy.createOnWarningHandler();
		const inputOptions: InputOptions = await this.#buildRollupInputOptions(options, onWarning);

		let bundle: RollupBuild;
		try
		{
			bundle = await rollup(inputOptions);
		}
		catch (error)
		{
			return {
				dependencies: [],
				bundles: [],
				warnings: [],
				errors: [error],
				standalone: options.standalone ?? false,
			};
		}

		const outputOptions: OutputOptions = this.#buildRollupOutputOptions(options);
		const globals = RollupBuildStrategy.makeGlobals(dependenciesRef);

		let result: RollupOutput;
		try
		{
			result = await bundle.generate({ ...outputOptions, globals })
		}
		catch (error)
		{
			return {
				dependencies: [],
				bundles: [],
				warnings: [],
				errors: [error],
				standalone: options.standalone ?? false,
			};
		}

		await bundle.close();

		const bundlesSize = RollupBuildStrategy.calculateBundlesSize(result.output);
		const sortedDependencies = RollupBuildStrategy.sortDependencies(dependenciesRef)

		return {
			dependencies: sortedDependencies,
			bundles: bundlesSize,
			warnings: [...warningsRef],
			errors: [],
			standalone: options.standalone ?? false,
		};
	}

	async #loadTsConfig(configPath: string): Promise<ParsedCommandLine>
	{
		const { default: ts } = await import('typescript');
		const tsConfig = ts.readConfigFile(configPath, ts.sys.readFile);
		const host = ts.createCompilerHost({}, true);

		const config = ts.parseJsonConfigFileContent(
			tsConfig.config,
			// @ts-ignore
			host,
			path.dirname(configPath)
		);

		// console.log(config);

		const configDirname = path.dirname(configPath);

		config.options.paths = Object.entries(config.options.paths).reduce((acc, [extensionName, paths]) => {
			acc[extensionName] = paths.map((filePath) => {
				return path.join(configDirname, filePath.replace('./', ''));
			});

			return acc;
		}, {});

		return config;
	}

	async #createTypeScriptPlugin(tsConfig: ParsedCommandLine, srcPath: string): Promise<Plugin>
	{
		const { default: typescriptPlugin } = await import('@rollup/plugin-typescript');

		return typescriptPlugin({
			tsconfig: false,
			target: 'esnext',
			include: [
				`${srcPath}/**`,
			],
			exclude: [
				'**/dist/**',
				'**/test/**',
				'bundle.config.ts',
			]
		});
	}

	async #buildRollupInputOptions(options: BuildOptions, onWarn: WarningHandlerWithDefault): Promise<InputOptions>
	{
		return {
			input: options.input,
			plugins: [
				...(() => {
					if (options.standalone)
					{
						return [RollupBuildStrategy.createStandalonePlugin()];
					}

					return [];
				})(),
				await (async () => {
					if (options.typescript)
					{
						const tsConfigPath = FileFinder.findUpFile({
							fileName: 'tsconfig.json',
							fromDir: path.dirname(options.input),
							rootDir: Environment.getRoot(),
						});

						if (typeof tsConfigPath === 'string' && tsConfigPath.length > 0)
						{
							console.time('loadConfig');
							const tsConfig = await this.#loadTsConfig(tsConfigPath);
							console.timeEnd('loadConfig');

							console.time('createPlugin');
							const plugin = await this.#createTypeScriptPlugin({}, path.dirname(options.input));
							console.timeEnd('createPlugin');

							return plugin;
						}
					}

					return Promise.resolve();
				})(),
				nodeResolve({
					browser: true,
				}),
				babelPlugin({
					babelHelpers: 'external',
					presets: [
						[
							presetEnv,
							{
								targets: options.targets,
								modules: false,
							},
						],
					],
					plugins: [
						flowStripTypesPlugin,
						externalHelpersPlugin,
					],
				}),
				commonjs(),
				postcss({
					extract: options.output.css,
					sourceMap: false,
					plugins: [

					]
				}),
				jsonPlugin(),
				imagePlugin(),
				// concatPlugin({
				//
				// }),
			],
			onwarn: onWarn,
			treeshake: {
				moduleSideEffects: false,
				propertyReadSideEffects: false,
				tryCatchDeoptimization: false,
			},
		}
	}

	#buildRollupOutputOptions(options: BuildOptions): OutputOptions
	{
		return {
			file: options.output.js,
			name: options.namespace,
			format: 'iife',
			banner: '/* eslint-disable */',
			extend: true,
			sourcemap: true,
		};
	}

	async #buildRollupBuildCodeInputOptions(options: BuildCodeOptions, onWarning: WarningHandlerWithDefault): Promise<InputOptions>
	{
		const sourceRollupInputOptions: InputOptions = await this.#buildRollupInputOptions(
			{
				input: 'source-code.js',
				output: {
					js: 'source-code.bundle.js',
					css: 'source-code.bundle.css',
				},
				typescript: options.typescript,
				targets: options.targets,
				namespace: options.namespace,
			},
			onWarning,
		);

		return {
			...sourceRollupInputOptions,
			plugins: [
				RollupBuildStrategy.createVirtualEntryPlugin({
					'source-code.js': options.code,
				}),
				// @ts-ignore
				...sourceRollupInputOptions.plugins,
			],
			treeshake: false,
		}
	}

	#buildRollupBuildCodeOutputOptions(options: BuildCodeOptions): OutputOptions
	{
		return {
			file: 'source-code.bundle.js',
			name: options.namespace,
			format: 'iife',
			banner: '/* eslint-disable */',
			extend: true,
		};
	}
}
