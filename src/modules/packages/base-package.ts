import * as path from 'node:path';
import * as fs from 'node:fs';
import fg from 'fast-glob';
import { spawn } from 'node:child_process';

import browserslist from 'browserslist';

import { BundleConfigManager } from '../config/bundle/bundle.config.manager';
import { PhpConfigManager } from '../config/php/php.config.manager';
import { MemoryCache } from '../../utils/memory-cache';
import { PackageResolver } from './package.resolver';
import { LintResult } from '../linter/lint.result';
import { Environment } from '../../environment/environment';
import { flattenTree } from '../../utils/flatten.tree';
import { buildDependenciesTree } from '../../utils/package/build.dependencies.tree';
import { RollupBuildStrategy } from '../services/build/strategies/rollup.strategy';

import type { BuildService } from '../services/build/build.service';
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

	constructor(options: BasePackageOptions)
	{
		this.#path = options.path;
	}

	#getBuildService(): Promise<BuildService>
	{
		return this.#cache.remember('buildService', async () => {
			const { BuildService } = await import('../services/build/build.service');

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

	getBundleConfigFilePath(): string | null
	{
		if (this.hasBundleConfigJsFile())
		{
			return this.getBundleConfigJsFilePath()
		}

		if (this.hasBundleConfigTsFile())
		{
			return this.getBundleConfigTsFilePath();
		}

		return null;
	}

	hasBundleConfigFile(): boolean
	{
		const bundleConfigFilePath = this.getBundleConfigFilePath();

		return (
			bundleConfigFilePath
			&& fs.existsSync(bundleConfigFilePath)
		);
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

	getTypeScriptSourceFiles(): Array<string>
	{
		return this.#cache.remember('typeScriptSourceFiles', () => {
			return this.getSourceFiles().filter((sourceFile) => {
				return sourceFile.endsWith(`.${BasePackage.TYPESCRIPT_EXTENSION}`);
			});
		});
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

	async build(): Promise<BuildResult>
	{
		const buildService = await this.#getBuildService();
		const buildOptions = this.#getBuildOptions();

		const buildResult = await buildService.build(buildOptions);

		const phpConfig = this.getPhpConfig();
		phpConfig.set('rel', buildResult.dependencies);
		phpConfig.save(this.getPhpConfigFilePath());

		return buildResult;
	}

	async generate(): Promise<BuildResult>
	{
		const buildService = await this.#getBuildService();
		const buildOptions = this.#getBuildOptions();

		return buildService.generate(buildOptions);
	}

	async lint(): Promise<LintResult>
	{
		const { ESLint } = await import('eslint');

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

			if (this.hasBundleConfigJsFile())
			{
				const buildService = await this.#getBuildService();
				const buildOptions = this.#getBuildOptions();
				const { dependencies } = await buildService.build(buildOptions);

				return dependencies.map((name: string) => {
					return { name };
				});
			}

			return [];
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
				return `import '${filePath}';`;
			})
			.join('\n');

		const buildService = await this.#getBuildService();
		const buildResult = await buildService.buildCode({
			code: sourceTestsCode,
			targets: this.getTargets(),
			typescript: false,
			namespace: 'BX.TestsBundle',
		});

		return buildResult.code;
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

	async runUnitTests(args: Record<string, any> = {}): Promise<any>
	{
		const playwright = await import('playwright');
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
				errors: [],
			};
		}
		catch (error)
		{
			return {
				report: [],
				errors: [error],
			};
		}
	}

	async runEndToEndTests(sourceArgs: Record<string, any> = {}): Promise<any>
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

