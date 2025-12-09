import * as path from 'node:path';
import * as fs from 'node:fs';
import { BundleConfigManager } from '../config/bundle/bundle.config.manager';
import { PhpConfigManager } from '../config/php/php.config.manager';
import { MemoryCache } from '../../utils/memory-cache';

import { rollup, type InputOptions, type OutputOptions, type RollupLog, type LoggingFunction, OutputChunk } from 'rollup';
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
import typescript, {FlexibleCompilerOptions} from '@rollup/plugin-typescript';
import browserslist from 'browserslist';
import { LintResult } from '../linter/lint.result';
import { ESLint } from 'eslint';
import { Environment } from '../../environment/environment';
import { flattenTree } from '../../utils/flatten.tree';
import { buildDependenciesTree } from '../../utils/package/build.dependencies.tree';
import type { DependencyNode } from './types/dependency.node';

import fg from 'fast-glob';
import playwright from 'playwright';

import { spawn } from 'node:child_process';
import {fail} from 'node:assert';

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

	getBaseTSConfig(): string
	{
		return path.join(this.getPath(), 'tsconfig.base.json');
	}

	hasBaseTSConfig(): boolean
	{
		return fs.existsSync(this.getBaseTSConfig());
	}

	getTSConfigPath(): string
	{
		return path.join(this.getPath(), 'tsconfig.json');
	}

	hasTSConfig(): boolean
	{
		return fs.existsSync(this.getTSConfigPath());
	}

	generateBaseTSConfig(dependencies: Array<string>): FlexibleCompilerOptions
	{
		return {
			compilerOptions: {
				paths: dependencies.reduce((acc, extensionName) => {
					const extension = PackageResolver.resolve(extensionName);
					const relativeInputPath = path.relative(this.getPath(), extension.getInputPath());

					acc[extensionName] = [relativeInputPath];

					return acc;
				}, {}),
			},
		};
	}

	generateTSConfig(): FlexibleCompilerOptions
	{
		return {
			extends: './tsconfig.base.json',
		};
	}

	generateTSConfigs()
	{
		if (this.getInputPath().endsWith('.ts'))
		{
			if (!this.hasTSConfig())
			{
				const tsConfig = this.generateTSConfig();
				const tsConfigContents = JSON.stringify(tsConfig, null, 4);

				fs.writeFileSync(this.getTSConfigPath(), tsConfigContents);
			}

			const dependencies = this.getExternalDependencies().map((dependencyNode) => {
				return dependencyNode.name;
			});

			const baseTSConfig = this.generateBaseTSConfig(dependencies);
			const baseTSConfigContents = JSON.stringify(baseTSConfig, null, 4);

			fs.writeFileSync(this.getBaseTSConfig(), baseTSConfigContents, 'utf-8');
		}
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

	getUnitTestsDirectoryPath(): string
	{
		return path.join(this.getPath(), 'test');
	}

	getEndToEndTestsDirectoryPath(): string
	{
		return path.join(this.getPath(), 'test', 'e2e');
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
				...(() => {
					if (this.getInputPath().endsWith('.ts'))
					{
						const tsconfig = JSON.parse(
							fs.readFileSync(
								path.join(Environment.getRoot(), 'tsconfig.json'),
								'utf8',
							),
						);

						return [
							typescript({
								tsconfig: false,
								compilerOptions: {
									target: 'ESNext',
									noEmitOnError: true,
									strict: true,
									paths: tsconfig.compilerOptions.paths,
								},
							}),
						];
					}

					return [];
				})(),
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

	async getUnitTests(): Promise<Array<string>>
	{
		const patterns = [
			'**/*.test.js',
			'!**/e2e'
		];

		return fg.async(
			patterns,
			{
				cwd: this.getUnitTestsDirectoryPath(),
				dot: true,
				onlyFiles: true,
				unique: true,
				absolute: true,
			},
		);
	}

	async getUnitTestsBundle(): Promise<string>
	{
		const sourceTestsCode = (await this.getUnitTests())
			.map((filePath) => {
				return `import './${path.relative(this.getPath(), filePath)}';`;
			})
			.join('\n');

		const dependencies = [];
		const rollupInputOptions = this.#getRollupInputOptions();
		const entries = {
			'sourceCode.js': sourceTestsCode,
		};
		const bundle = await rollup({
			...rollupInputOptions,
			input: 'sourceCode.js',
			plugins: [
				{
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
				},
				...(() => {
					if (Array.isArray(rollupInputOptions.plugins))
					{
						return rollupInputOptions.plugins;
					}

					return [];
				})(),
			],
			onwarn: (warning, warn) => {
				if (warning.code === 'UNRESOLVED_IMPORT' && isExternalDependencyName(warning.exporter))
				{
					dependencies.push(warning.exporter);

					return;
				}

				warn(warning);
			},
			treeshake: false,
		});

		const globals = dependencies.reduce((acc, dependency) => {
			const extension = PackageResolver.resolve(dependency);
			if (extension)
			{
				return { ...acc, ...extension.getGlobal() };
			}

			return acc;
		}, {});

		const result = await bundle.generate({
			file: path.join(this.getPath(), 'test.bundle.js'),
			format: 'iife',
			banner: '/* eslint-disable */',
			extend: true,
			globals: {
				...globals,
			},
		});

		await bundle.close();

		const outputEntry = result.output.at(0) as OutputChunk;

		return outputEntry?.code;
	}

	async getEndToEndTests(): Promise<Array<string>>
	{
		const patterns = [
			'**/*.test.js',
			'**/*.spec.js',
		];

		return fg.async(
			patterns,
			{
				cwd: this.getEndToEndTestsDirectoryPath(),
				dot: true,
				onlyFiles: true,
				unique: true,
				absolute: true,
			},
		);
	}

	async runUnitTests(args: Record<string, any>): Promise<any> {
		const browser = await playwright.chromium.launch({
			headless: args.headed !== true,
		});
		const context = await browser.newContext();
		const page = await context.newPage();

		try
		{
			await page.goto(`https://bitrix24.io/dev/ui/cli/mocha-wrapper.php?extension=${this.getName()}`);

			const testsCodeBundle = await this.getUnitTestsBundle();

			const report = [];
			page.on('console', async (message) => {
				const values = [];
				for (const arg of message.args())
				{
					values.push(await arg.jsonValue());
				}

				const [key, value] = values;
				if (key === 'unit_report_token')
				{
					try
					{
						report.push(JSON.parse(value));
					}
					catch (error)
					{
						console.error(error);
					}
				}
			});

			await page.evaluate(() => {
				globalThis.mocha.setup({
					ui: 'bdd',
					// @ts-ignore
					reporter: ProxyReporter,
					checkLeaks: true,
					timeout: 10000,
					inlineDiffs: true,
					color: true,
				});
			});

			await page.addScriptTag({
				content: testsCodeBundle,
			});

			type TestStats = Promise<{ stats: any }>;

			const { stats } = await page.evaluate((): TestStats => {
				return new Promise((resolve) => {
					globalThis.mocha.run(() => {
						resolve({
							stats: globalThis.mocha.stats,
						});
					});
				});
			});


			return {
				report,
				stats,
			};
		}
		catch (error)
		{
			console.error('Error during test execution:', error);
			throw error;
		}
	}

	async runEndToEndTests(sourceArgs: Record<string, any>): Promise<any>
	{
		const tests = await this.getEndToEndTests();
		if (tests.length === 0)
		{
			return Promise.resolve({
				status: 'NO_TESTS_FOUND',
				code: 1,
			});
		}

		const args = ['playwright', 'test', ...tests];

		if (Object.hasOwn(sourceArgs, 'headed'))
		{
			args.push('--headed');
		}

		if (Object.hasOwn(sourceArgs, 'debug'))
		{
			args.push('--debug');
		}

		if (Object.hasOwn(sourceArgs, 'grep'))
		{
			args.push('--grep');
		}

		const process = spawn('npx', args, {
			stdio: 'inherit',
			cwd: global.process.cwd(),
		});

		return new Promise((resolve, reject) => {
			process.on('close', (code) => {
				if (code === 0)
				{
					resolve({
						status: 'TESTS_PASSED',
						code: 0,
					});
				}
				else
				{
					reject({
						status: 'TESTS_FAILED',
						code: 0,
					});
				}
			});
		});
	}
}

