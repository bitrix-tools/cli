import * as path from 'node:path';
import * as fs from 'node:fs';
import fg from 'fast-glob';
import { spawn } from 'node:child_process';

import playwright from 'playwright';
import browserslist from 'browserslist';
import { ESLint } from 'eslint';

import { babel } from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import presetEnv from '@babel/preset-env';
import flowStripTypesPlugin from '@babel/plugin-transform-flow-strip-types';
import externalHelpersPlugin from '@babel/plugin-external-helpers';

import { rollup, type InputOptions, type RollupLog, type LoggingFunction, OutputChunk } from 'rollup';
import postcss from 'rollup-plugin-postcss';
import jsonPlugin from '@rollup/plugin-json';
import imagePlugin from '@rollup/plugin-image';
import typescript, { FlexibleCompilerOptions } from '@rollup/plugin-typescript';

import { BundleConfigManager } from '../config/bundle/bundle.config.manager';
import { PhpConfigManager } from '../config/php/php.config.manager';
import { MemoryCache } from '../../utils/memory-cache';
import { isExternalDependencyName } from '../../utils/is.external.dependency.name';
import { PackageResolver } from './package.resolver';
import { LintResult } from '../linter/lint.result';
import { Environment } from '../../environment/environment';
import { flattenTree } from '../../utils/flatten.tree';
import { buildDependenciesTree } from '../../utils/package/build.dependencies.tree';
import { BuildService } from '../services/build/build.service';
import { RollupBuildStrategy } from '../services/build/strategies/rollup.strategy';
import type { BuildOptions, BuildResult } from '../services/build/types/build.service.types';
import type { DependencyNode } from './types/dependency.node';

type BasePackageOptions = {
	path: string,
};

export abstract class BasePackage
{
	static TYPESCRIPT_EXTENSION = 'ts';
	static JAVASCRIPT_EXTENSION = 'js';
	static SOURCE_FILES_PATTERN: Array<string> = [
		`**/*.${BasePackage.JAVASCRIPT_EXTENSION}`,
		`**/*.${BasePackage.TYPESCRIPT_EXTENSION}`,
	];

	readonly #path: string;
	readonly #cache: MemoryCache = new MemoryCache();
	readonly #warnings: Set<RollupLog> = new Set<RollupLog>();
	readonly #errors: Set<RollupLog> = new Set<RollupLog>();
	readonly #externalDependencies: Array<DependencyNode> = [];

	constructor(options: BasePackageOptions)
	{
		this.#path = options.path;
	}

	#getBuildService(): BuildService
	{
		return this.#cache.remember('buildService', () => {
			return new BuildService(
				new RollupBuildStrategy(),
			);
		});
	}

	getPath(): string
	{
		return this.#path;
	}

	getBundleConfigJsFilePath(): string
	{
		return path.join(this.getPath(), 'bundle.config.js');
	}

	hasBundleConfigJsFile(): boolean
	{
		return fs.existsSync(this.getBundleConfigJsFilePath());
	}

	getBundleConfigTsFilePath(): string
	{
		return path.join(this.getPath(), 'bundle.config.ts');
	}

	hasBundleConfigTsFile(): boolean
	{
		return fs.existsSync(this.getBundleConfigTsFilePath());
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
			if (this.hasBundleConfigJsFile())
			{
				config.loadFromFile(this.getBundleConfigJsFilePath());
			}
			else if (this.hasBundleConfigTsFile())
			{
				config.loadFromFile(this.getBundleConfigTsFilePath());
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
		const query = (() => {
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
		})();

		return browserslist(query);
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

	getSourceDirectoryPath(): string
	{
		return path.join(this.getPath(), 'src');
	}

	getSourceFiles(): Array<string>
	{
		return this.#cache.remember('sourceFiles', () => {
			return fg.sync(
				BasePackage.SOURCE_FILES_PATTERN,
				{
					cwd: this.getSourceDirectoryPath(),
					dot: true,
					onlyFiles: true,
					unique: true,
					absolute: true,
				},
			);
		});
	}

	getJavaScriptSourceFiles(): Array<string>
	{
		return this.#cache.remember('javaScriptSourceFiles', () => {
			return this.getSourceFiles().filter((sourceFile) => {
				return sourceFile.endsWith(`.${BasePackage.JAVASCRIPT_EXTENSION}`);
			});
		});
	}

	removeJavaScriptSourceFiles()
	{
		this.getJavaScriptSourceFiles().forEach((sourceFile) => {
			if (fs.existsSync(sourceFile))
			{
				fs.unlinkSync(sourceFile);
			}
		});

		this.#cache.forget('sourceFiles');
		this.#cache.forget('javaScriptSourceFiles');
	}

	getTypeScriptSourceFiles(): Array<string>
	{
		return this.#cache.remember('typeScriptSourceFiles', () => {
			return this.getSourceFiles().filter((sourceFile) => {
				return sourceFile.endsWith(`.${BasePackage.TYPESCRIPT_EXTENSION}`);
			});
		});
	}

	removeTypeScriptSourceFiles()
	{
		this.getTypeScriptSourceFiles().forEach((sourceFile) => {
			if (fs.existsSync(sourceFile))
			{
				fs.unlinkSync(sourceFile);
			}
		});

		this.#cache.forget('sourceFiles');
		this.#cache.forget('typeScriptSourceFiles');
	}

	getActualSourceFiles(): Array<string>
	{
		if (this.isTypeScriptMode())
		{
			return this.getTypeScriptSourceFiles();
		}

		return this.getJavaScriptSourceFiles();
	}

	isTypeScriptMode(): boolean
	{
		return this.getInputPath().endsWith('.ts');
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
					if (this.isTypeScriptMode())
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

						const paths = (() => {
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

						return [
							typescript({
								tsconfig: false,
								compilerOptions: {
									target: 'ESNext',
									noEmitOnError: true,
									strict: false,
									paths,
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

	#getBuildOptions(): BuildOptions
	{
		return {
			input: this.getInputPath(),
			output: {
				js: this.getOutputJsPath(),
				css: this.getOutputCssPath(),
			},
			targets: this.getTargets(),
			namespace: this.getBundleConfig().get('namespace'),
			typescript: this.isTypeScriptMode(),
		};
	}

	async build(): Promise<{
		warnings: Array<RollupLog>,
		errors: Array<RollupLog>,
		bundles: Array<{
			fileName: string,
			size: number,
		}>,
		dependenciesCount: number,
	}>
	{
		const buildService = this.#getBuildService();

		const {
			warnings,
			errors,
			dependencies,
			bundles,
		}: BuildResult = await buildService.build(this.#getBuildOptions());

		this.getPhpConfig().set('rel', dependencies);
		this.getPhpConfig().save(this.getPhpConfigFilePath());

		return {
			warnings,
			errors,
			bundles,
			dependenciesCount: dependencies.length,
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

			const buildService = this.#getBuildService();
			const buildOptions = this.#getBuildOptions();
			const { dependencies } = await buildService.build(buildOptions);

			return dependencies.map((name: string) => {
				return { name };
			});
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
				// @ts-ignore
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
					// @ts-ignore
					globalThis.mocha.run(() => {
						resolve({
							// @ts-ignore
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

