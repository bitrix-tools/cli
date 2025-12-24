import path from 'node:path';
import fs from 'node:fs';

import {
	rollup,
	type InputOptions,
	type OutputOptions,
	type RollupLog,
	type Plugin,
	type RollupBuild,
	type RollupOutput,
	type WarningHandlerWithDefault,
} from "rollup";

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

import type {
	BuildResult,
	BuildOptions,
	BundleFileInfo,
	BuildCodeOptions,
	BuildCodeResult,
} from '../types/build.service.types';
import type { FlexibleCompilerOptions } from '@rollup/plugin-typescript';


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

	async build(options: BuildOptions): Promise<BuildResult>
	{
		const { onWarning, warningsRef, dependenciesRef } = RollupBuildStrategy.createOnWarningHandler();
		const inputOptions: InputOptions = await this.#buildRollupInputOptions(options, onWarning);

		const bundle: RollupBuild = await rollup(inputOptions);

		const outputOptions: OutputOptions = this.#buildOutputOptions(options);
		const globals = RollupBuildStrategy.makeGlobals(dependenciesRef);
		const result: RollupOutput = await bundle.write({ ...outputOptions, globals });

		await bundle.close();

		const bundlesSize = RollupBuildStrategy.calculateBundlesSize(result.output);

		return {
			dependencies: [...dependenciesRef],
			bundles: bundlesSize,
			warnings: [...warningsRef],
			errors: [],
		};
	}

	async buildCode(options: BuildCodeOptions): Promise<BuildCodeResult>
	{
		const { onWarning, warningsRef, dependenciesRef } = RollupBuildStrategy.createOnWarningHandler();
		const inputOptions: InputOptions = await this.#buildRollupInputOptions(options, onWarning);

		const bundle: RollupBuild = await rollup(inputOptions);

		const outputOptions: OutputOptions = this.#buildOutputOptions(options);
		const globals = RollupBuildStrategy.makeGlobals(dependenciesRef);
		const result: RollupOutput = await bundle.write({ ...outputOptions, globals });

		await bundle.close();

		const bundlesSize = RollupBuildStrategy.calculateBundlesSize(result.output);

		return {
			dependencies: [...dependenciesRef],
			code: '',
			warnings: [...warningsRef],
			errors: [],
		};
	}

	async generate(options: BuildOptions): Promise<BuildResult>
	{
		const { onWarning, warningsRef, dependenciesRef } = RollupBuildStrategy.createOnWarningHandler();
		const inputOptions: InputOptions = await this.#buildRollupInputOptions(options, onWarning);

		const bundle: RollupBuild = await rollup(inputOptions);

		const outputOptions: OutputOptions = this.#buildOutputOptions(options);
		const globals = RollupBuildStrategy.makeGlobals(dependenciesRef);
		const result: RollupOutput = await bundle.generate({ ...outputOptions, globals });

		await bundle.close();

		const bundlesSize = RollupBuildStrategy.calculateBundlesSize(result.output);

		return {
			dependencies: [...dependenciesRef],
			bundles: bundlesSize,
			warnings: [...warningsRef],
			errors: [],
		};
	}

	#generatePaths(): FlexibleCompilerOptions['paths']
	{
		const tsconfig = (() => {
			const rootTSConfigPath = path.join(Environment.getRoot(), 'tsconfig.json');
			if (fs.existsSync(rootTSConfigPath))
			{
				return JSON.parse(
					fs.readFileSync(rootTSConfigPath, 'utf8'),
				);
			}

			return {};
		})();

		return (() => {
			if (tsconfig?.compilerOptions?.paths)
			{
				return Object.entries(tsconfig.compilerOptions.paths).reduce((acc, [key, value]) => {
					return {
						...acc,
						[key]: [path.join(tsconfig.compilerOptions.baseUrl, String(value[0]))],
					}
				}, {});
			}

			return {};
		})();
	}

	async #createTypeScriptPlugin(): Promise<Plugin>
	{
		const { default: typescriptPlugin } = await import('@rollup/plugin-typescript');

		return typescriptPlugin({
			tsconfig: false,
			compilerOptions: {
				target: 'ESNext',
				noEmitOnError: true,
				strict: false,
				paths: this.#generatePaths(),
			},
		});
	}

	async #buildRollupInputOptions(options: BuildOptions, onWarn: WarningHandlerWithDefault): Promise<InputOptions>
	{
		return {
			input: options.input,
			plugins: [
				...(() => {
					if (options.typescript)
					{
						return [
							this.#createTypeScriptPlugin(),
						];
					}

					return [];
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
			],
			onwarn: onWarn,
			treeshake: {
				moduleSideEffects: false,
				propertyReadSideEffects: false,
				tryCatchDeoptimization: false,
			},
		}
	}

	#buildOutputOptions(options: BuildOptions): OutputOptions
	{
		return {
			file: options.output.js,
			name: options.namespace,
			format: 'iife',
			banner: '/* eslint-disable */',
			extend: true,
		};
	}
}
