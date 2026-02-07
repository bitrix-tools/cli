import { Command } from 'commander';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { confirm } from '@inquirer/prompts';

import { Environment } from '../../environment/environment';
import { pathOption } from './options/path-option';
import { resolvePackage } from '../../utils/package/resolve-package';
import { renderTemplate } from '../../utils/render.template';
import { FileFinder } from '../../utils/file.finder';
import { createInputFileName } from '../../utils/create.input.file.name';
import { createOutputFileName } from '../../utils/create.output.file.name';
import { createNamespace } from '../../utils/create.namespace';
import { toPascalCase } from '../../utils/to.pascal.case';

export const createCommand = new Command('create');

createCommand
	.description('Create bitrix extensions')
	.argument('<name>', 'Extension name')
	.option('-t, --tech [tech]', 'Extension technology name')
	.addOption(pathOption)
	.action(async (extensionName, args) => {
		const packagePath = resolvePackage(extensionName);
		const isDirectoryExists = await (async () => {
			try
			{
				return (await fs.lstat(packagePath)).isDirectory();
			}
			catch
			{
				return false;
			}
		})();

		if (isDirectoryExists)
		{
			const isProceed = await confirm({
				message: `The directory '${packagePath}' already exists. Continue?`,
				default: false,
			});

			if (!isProceed)
			{
				return;
			}
		}

		const useTS = (() => {
			if (args.tech === 'js')
			{
				return false;
			}

			if (args.tech === 'ts')
			{
				return true;
			}

			const tsConfig = FileFinder.findUpFile({
				fileName: 'tsconfig.json',
				fromDir: packagePath,
				rootDir: Environment.getRoot(),
			});

			return typeof tsConfig === 'string' && tsConfig.length > 0;
		})();

		const useBrowserslist = (() => {
			const browsersListPath = FileFinder.findUpFile({
				fileName: '.browserslistrc',
				fromDir: packagePath,
				rootDir: Environment.getRoot(),
			});

			return typeof browsersListPath === 'string' && browsersListPath.length > 0;
		})();

		const bundleConfigTemplateName = useTS ? 'bundle.config.ts.txt' : 'bundle.config.js.txt';
		const bundleConfigTemplatePath = path.join(__dirname, 'templates', bundleConfigTemplateName);
		const bundleConfigTemplate = await fs.readFile(bundleConfigTemplatePath, 'utf8');

		const bundleConfigOptions = {
			inputPath: `./${createInputFileName(extensionName, useTS ? 'ts' : 'js')}`,
			outputPath: `./${createOutputFileName(extensionName, 'js')}`,
			namespace: createNamespace(extensionName),
			browserslist: useBrowserslist,
		};

		const bundleConfigContent = renderTemplate({
			template: bundleConfigTemplate,
			replacements: bundleConfigOptions,
		});

		const configPhpTemplatePath = path.join(__dirname, 'templates', 'config.php.txt');
		const configPhpTemplate = await fs.readFile(configPhpTemplatePath, 'utf8');
		const templatePhpConfigOptions = {
			jsPath: `./${createOutputFileName(extensionName, 'js')}`,
			cssPath: `./${createOutputFileName(extensionName, 'css')}`,
		};
		const configPhpContent = renderTemplate({
			template: configPhpTemplate,
			replacements: templatePhpConfigOptions,
		});

		const inputFileTemplatePath = path.join(__dirname, 'templates', 'input.js.txt');
		const inputFileTemplate = await fs.readFile(inputFileTemplatePath, 'utf8');
		const inputFileTemplateOptions = {
			name: toPascalCase(extensionName.split('.').at(-1)),
		};
		const inputFileContent = renderTemplate({
			template: inputFileTemplate,
			replacements: inputFileTemplateOptions,
		});

		const unitTestTemplatePath = path.join(__dirname, 'templates', 'unit.test.ts.txt');
		const unitTestTemplate = await fs.readFile(unitTestTemplatePath, 'utf8');
		const unitTestTemplateOptions = {
			extensionName,
			name: toPascalCase(extensionName.split('.').at(-1)),
			inputPath: createInputFileName(extensionName, ''),
		};
		const unitTestContent = renderTemplate({
			template: unitTestTemplate,
			replacements: unitTestTemplateOptions,
		});

		const endToEndTestTemplatePath = path.join(__dirname, 'templates', 'e2e.spec.ts.txt');
		const endToEndTestTemplate = await fs.readFile(endToEndTestTemplatePath, 'utf8');
		const endToEndTestTemplateOptions = {
			name: toPascalCase(extensionName.split('.').at(-1)),
		};
		const endToEndTestContent = renderTemplate({
			template: endToEndTestTemplate,
			replacements: endToEndTestTemplateOptions,
		});

		await fs.mkdir(packagePath, { recursive: true });

		const bundleConfigPath = path.join(packagePath, `bundle.config.${useTS ? 'ts' : 'js'}`);
		await fs.writeFile(bundleConfigPath, bundleConfigContent, 'utf8');

		const configPhpPath = path.join(packagePath, 'config.php');
		await fs.writeFile(configPhpPath, configPhpContent, 'utf8');

		await fs.mkdir(path.join(packagePath, 'src'), { recursive: true });
		const inputFilePath = path.join(packagePath, 'src', createInputFileName(extensionName, useTS ? 'ts' : 'js'));
		await fs.writeFile(inputFilePath, inputFileContent, 'utf8');

		await fs.mkdir(path.join(packagePath, 'test', 'unit'), { recursive: true });
		const unitTestPath = path.join(packagePath, 'test', 'unit', createInputFileName(extensionName, useTS ? 'test.ts' : '.test.js'));
		await fs.writeFile(unitTestPath, unitTestContent, 'utf8');

		await fs.mkdir(path.join(packagePath, 'test', 'e2e'), { recursive: true });
		const endToEndTestPath = path.join(packagePath, 'test', 'e2e', createInputFileName(extensionName, useTS ? 'spec.ts' : '.spec.js'));
		await fs.writeFile(endToEndTestPath, endToEndTestContent, 'utf8');
	});


