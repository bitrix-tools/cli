import * as path from 'node:path';
import * as fs from 'node:fs';
import { BundleConfigManager } from '../config/bundle/bundle.config.manager';
import { PhpConfigManager } from '../config/php/php.config.manager';
import { MemoryCache } from '../../utils/memory-cache';

import { rollup, type InputOptions, type OutputOptions, type RollupLog, type LoggingFunction } from 'rollup';
import { babel } from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import presetEnv from '@babel/preset-env';
import flowStripTypesPlugin from '@babel/plugin-transform-flow-strip-types';
import externalHelpersPlugin from '@babel/plugin-external-helpers';
import { isExternalDependencyName } from '../../utils/is.external.dependency.name';
import { PackageResolver } from './package.resolver';
import postcss from 'rollup-plugin-postcss';
import jsonPlugin from '@rollup/plugin-json';
import imagePlugin from '@rollup/plugin-image';
import browserslist from 'browserslist';
import { LintResult } from '../linter/lint.result';
import { ESLint } from 'eslint';
import { Environment } from '../../environment/environment';
import { flattenTree } from '../../utils/flatten.tree';
import { buildDependenciesTree } from '../../utils/package/build.dependencies.tree';
import type { DependencyNode } from './types/dependency.node';

type BasePackageOptions = {
	path: string,
};

export abstract class BasePackage
{
	readonly #path: string;
	readonly #cache: MemoryCache = new MemoryCache();
	readonly #warnings: Set<RollupLog> = new Set<RollupLog>();
	readonly #errors: Set<RollupLog> = new Set<RollupLog>();
	readonly #externalDependencies: Array<DependencyNode> = [];

	constructor(options: BasePackageOptions)
	{
		this.#path = options.path;
	}

	getPath(): string
	{
		return this.#path;
	}

	getBundleConfigFilePath(): string
	{
		return path.join(this.getPath(), 'bundle.config.js');
	}

	hasBundleConfigFile(): boolean
	{
		return fs.existsSync(this.getBundleConfigFilePath());
	}

	getScriptEs6FilePath(): string
	{
		return path.join(this.getPath(), 'script.es6.js');
	}

	hasScriptEs6FilePath(): boolean
	{
		return fs.existsSync(this.getScriptEs6FilePath());
	}

	getPhpConfigFilePath(): string
	{
		return path.join(this.getPath(), 'config.php');
	}

	hasPhpConfigFile(): boolean
	{
		return fs.existsSync(this.getPhpConfigFilePath());
	}

	getPhpConfig(): any
	{
		return this.#cache.remember('phpConfig', () => {
			const config = new PhpConfigManager();
			if (this.hasPhpConfigFile())
			{
				config.loadFromFile(this.getPhpConfigFilePath());
			}

			return config;
		});
	}

	abstract getName(): string
	abstract getModuleName(): string

	getBundleConfig(): BundleConfigManager
	{
		return this.#cache.remember('bundleConfig', () => {
			const config = new BundleConfigManager();
			if (this.hasBundleConfigFile())
			{
				config.loadFromFile(this.getBundleConfigFilePath());
			}
			else if (this.hasScriptEs6FilePath())
			{
				config.set('input', 'script.es6.js');
				config.set('output', { js: './script.js', css: './style.css' });
				config.set('adjustConfigPhp', false);
			}

			return config;
		});
	}

	addError(error: any)
	{
		this.#errors.add(error);
	}

	getErrors(): Array<any>
	{
		return [...this.#errors];
	}

	addWarning(warning: RollupLog)
	{
		this.#warnings.add(warning);
	}

	getWarnings(): Array<RollupLog>
	{
		return [...this.#warnings];
	}

	getWarningsSummary(): string
	{
		const counts = this.getWarnings().reduce((acc, warning) => {
			if (!Object.hasOwn(acc, warning.code))
			{
				acc[warning.code] = 0;
			}

			acc[warning.code] += 1;

			return acc;
		}, {});

		return Object.entries(counts).map(([key, count]) => {
			return `${key}: ${count}`;
		}).join('\n  ');
	}

	addExternalDependency(dependency: DependencyNode)
	{
		const hasDependency = this.#externalDependencies.find((currentDependency: DependencyNode) => {
			return currentDependency.name === dependency.name
		});

		if (!hasDependency)
		{
			this.#externalDependencies.push(dependency);
		}
	}

	getExternalDependencies(): Array<DependencyNode>
	{
		return this.#cache.remember('externalDependencies', () => {
			return [...this.#externalDependencies].sort((a: DependencyNode, b: DependencyNode) => {
				const prefixA = a.name.split('.')[0];
				const prefixB = b.name.split('.')[0];

				if (prefixA !== prefixB)
				{
					return prefixA.localeCompare(prefixB);
				}

				return a.name.localeCompare(b.name);
			});
		});
	}

	getTargets(): Array<string>
	{
		const bundleConfig = this.getBundleConfig();
		if (bundleConfig.get('browserslist') === true)
		{
			const targets = browserslist.loadConfig({
				path: this.getPath(),
			});

			if (targets.length > 0)
			{
				return targets;
			}
		}

		return bundleConfig.get('browserslist');
	}

	getGlobal(): { [name: string]: string }
	{
		const name = this.getName();
		const namespace = this.getBundleConfig().get('namespace');

		return { [name]: namespace };
	}

	getGlobals(): Record<string, string>
	{
		return this.getExternalDependencies().reduce((acc, dependency) => {
			const extension = PackageResolver.resolve(dependency.name);
			if (extension)
			{
				return { ...acc, ...extension.getGlobal() };
			}

			return acc;
		}, {});
	}

	getInputPath(): string
	{
		return path.join(this.getPath(), this.getBundleConfig().get('input'));
	}

	getOutputJsPath(): string
	{
		return path.join(this.getPath(), this.getBundleConfig().get('output').js);
	}

	getOutputCssPath(): string
	{
		return path.join(this.getPath(), this.getBundleConfig().get('output').css);
	}

	#onWarnHandler(warning: RollupLog, warn: LoggingFunction)
	{
		if (warning.code === 'UNRESOLVED_IMPORT' && isExternalDependencyName(warning.exporter))
		{
			this.addExternalDependency({
				name: warning.exporter,
			});

			return;
		}

		this.addWarning(warning);
	}

	#getRollupInputOptions(): InputOptions
	{
		return {
			input: this.getInputPath(),
			plugins: [
				nodeResolve({
					browser: true,
				}),
				babel({
					babelHelpers: 'external',
					presets: [
						[
							presetEnv,
							{
								targets: this.getTargets(),
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
					extract: this.getOutputCssPath(),
					sourceMap: false,
					plugins: [

					]
				}),
				jsonPlugin(),
				imagePlugin(),
			],
			onwarn: this.#onWarnHandler.bind(this),
			treeshake: {
				moduleSideEffects: false,
				propertyReadSideEffects: false,
				tryCatchDeoptimization: false,
			},
		};
	}

	#getRollupOutputOptions(): OutputOptions
	{
		return {
			file: this.getOutputJsPath(),
			name: this.getBundleConfig().get('namespace'),
			format: 'iife',
			banner: '/* eslint-disable */',
			extend: true,
			globals: {
				...this.getGlobals(),
			},
		};
	}

	async build(): Promise<{
		warnings: Array<RollupLog>,
		errors: Array<RollupLog>,
		warningsSummary: string,
		bundles: Array<{
			fileName: string,
			size: number,
			type: 'chunk' | 'asset';
		}>,
		externalDependenciesCount: number,
	}>
	{
		const bundle = await rollup(
			this.#getRollupInputOptions(),
		);

		const result = await bundle.write(
			this.#getRollupOutputOptions(),
		);

		await bundle.close();

		const warnings = this.getWarnings();
		const warningsSummary = this.getWarningsSummary();
		const errors = this.getErrors();
		const externalDependenciesCount = this.getExternalDependencies().length;
		const bundles = result.output.map((chunk) => {
			const size =
				chunk.type === 'asset'
					? Buffer.byteLength(chunk.source, 'utf8')
					: Buffer.byteLength(chunk.code, 'utf8');

			return {
				fileName: chunk.fileName,
				size,
				type: chunk.type
			};
		});

		const rel = this.getExternalDependencies().map((dependency: DependencyNode) => {
			return dependency.name;
		});

		this.getPhpConfig().set('rel', rel);
		this.getPhpConfig().save(this.getPhpConfigFilePath());

		this.#externalDependencies.splice(0, this.#externalDependencies.length);
		this.#warnings.clear();
		this.#errors.clear();

		return {
			warnings,
			warningsSummary,
			errors,
			bundles,
			externalDependenciesCount,
		};
	}

	async lint(): Promise<LintResult>
	{
		const eslint = new ESLint({
			errorOnUnmatchedPattern: false,
			cwd: Environment.getRoot(),
		});

		const results = await eslint.lintFiles(
			path.join(this.getPath(), 'src', '**/*.js'),
		);

		return new LintResult({
			results,
		});
	}

	async getDependencies(): Promise<Array<DependencyNode>>
	{
		return this.#cache.remember('dependencies', async () => {
			const phpConfig = this.getPhpConfig();
			if (phpConfig)
			{
				const rel = phpConfig.get('rel');
				if (Array.isArray(rel))
				{
					return rel.map((name: string) => {
						return { name };
					});
				}
			}

			void await rollup(
				this.#getRollupInputOptions(),
			);

			return this.getExternalDependencies();
		});
	}

	async getDependenciesTree(options: { size?: boolean, unique?: boolean } = {}): Promise<Array<DependencyNode>>
	{
		return this.#cache.remember(`dependenciesTree+${options.size}+${options.unique}`, () => {
			return buildDependenciesTree({
				target: this,
				...options,
			});
		});
	}

	async getFlattedDependenciesTree(unique: boolean = true): Promise<Array<DependencyNode>>
	{
		return this.#cache.remember(`flattedDependenciesTree+${unique}`, async () => {
			return flattenTree(await this.getDependenciesTree(), unique);
		});
	}

	normalizePath(sourcePath: string): string
	{
		if (sourcePath.startsWith('/'))
		{
			const nameSegment = `${this.getName().split('.').join('/')}/`;
			const [, relativePath] = sourcePath.split(nameSegment);

			return relativePath;
		}

		return sourcePath;
	}

	getBundlesSize(): { css: number, js: number }
	{
		return this.#cache.remember('bundleSize', () => {
			let result = { css: 0, js: 0 };
			const isExistJsBundle = fs.existsSync(this.getOutputJsPath());
			const isExistCssBundle = fs.existsSync(this.getOutputCssPath());
			if (isExistJsBundle || isExistCssBundle)
			{
				if (fs.existsSync(this.getOutputJsPath()))
				{
					result.js = fs.statSync(this.getOutputJsPath()).size;
				}

				if (fs.existsSync(this.getOutputCssPath()))
				{
					result.css = fs.statSync(this.getOutputCssPath()).size;
				}
			}
			else
			{
				const phpConfig = this.getPhpConfig();
				const jsFiles = [phpConfig.get('js')].flat(2);
				const cssFiles = [phpConfig.get('css')].flat(2);

				result.js = jsFiles.reduce((acc, filePath) => {
					if (filePath.length > 0)
					{
						const normalizedPath = this.normalizePath(filePath);
						const fullPath = path.join(this.getPath(), normalizedPath);
						if (fs.existsSync(fullPath))
						{
							acc += fs.statSync(fullPath).size;
						}
					}

					return acc;
				}, 0);

				result.css = cssFiles.reduce((acc, filePath) => {
					if (filePath.length > 0)
					{
						const normalizedPath = this.normalizePath(filePath);
						const fullPath = path.join(this.getPath(), normalizedPath);
						if (fs.existsSync(fullPath))
						{
							acc += fs.statSync(fullPath).size;
						}
					}

					return acc;
				}, 0);
			}

			return result;
		});
	}

	async getDependenciesSize(): Promise<{ js: number, css: number }>
	{
		return this.#cache.remember('getDependenciesSize', async () => {
			const dependencies = await this.getFlattedDependenciesTree();

			return dependencies.reduce((acc, dependency: DependencyNode) => {
				const extension = PackageResolver.resolve(dependency.name);
				if (extension)
				{
					const { js, css } = extension.getBundlesSize();
					acc.js += js;
					acc.css += css;
				}

				return acc;

			}, { js: 0, css: 0 });
		});
	}

	async getTotalTransferredSize(): Promise<{ css: number, js: number }>
	{
		const bundlesSize = this.getBundlesSize();
		const dependenciesSize = await this.getDependenciesSize();

		return {
			js: bundlesSize.js + dependenciesSize.js,
			css: bundlesSize.css + dependenciesSize.css,
		};
	}
}

