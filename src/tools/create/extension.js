import * as fs from 'fs';
import camelcase from 'camelcase';
import {resolve, relative} from 'path';
import slash from 'slash';
import {appRoot} from '../../constants';
import buildExtensionName from '../../utils/build-extension-name';
import render from '../render';
import buildNamespaceName from '../../utils/build-namespace-name';

const templatePath = resolve(appRoot, 'src/templates');
const extensionTemplatePath = resolve(templatePath, 'extension');
const configTemplatePath = resolve(extensionTemplatePath, 'bundle.config.js');
const inputTemplatePath = resolve(extensionTemplatePath, 'input.js');
const defaultOptions = {test: true};

export default function createExtension(directory, options = defaultOptions) {
	if (typeof directory !== 'string') {
		throw new Error('directory is not string');
	}

	if (!fs.existsSync(directory)) {
		throw new Error('directory is not exists');
	}

	const extensionPath = resolve(directory, options.name.toLowerCase());
	const inputPath = resolve(extensionPath, `src/${options.name}.js`);
	const outputPath = resolve(extensionPath, `dist/${options.name}.bundle.js`);
	const configPath = resolve(extensionPath, 'bundle.config.js');
	const extensionName = buildExtensionName(inputPath, extensionPath);
	const namespaceName = buildNamespaceName({root: 'BX', extensionName});

	render({
		input: inputTemplatePath,
		output: inputPath,
		data: {
			name: camelcase(options.name, {pascalCase: true}),
			nameLower: `${options.name}`.toLowerCase(),
		},
	});

	const additionalOptions = (() => {
		let acc = '';
		if (options.browserslist)
		{
			acc += `\n\tbrowserslist: ${options.browserslist},`;
		}

		if (options.minification)
		{
			acc += `\n\tminification: ${options.minification},`;
		}

		if (options.sourceMaps === false)
		{
			acc += `\n\tsourceMaps: ${options.sourceMaps},`;
		}

		return acc;
	})();

	render({
		input: configTemplatePath,
		output: configPath,
		data: {
			input: slash(relative(extensionPath, inputPath)),
			output: slash(relative(extensionPath, outputPath)),
			namespace: namespaceName,
			additionalOptions,
		},
	});

	if (options.tests) {
		const testTemplatePath = resolve(extensionTemplatePath, 'test.js');
		const testFilePath = resolve(extensionPath, `test/${options.name}/${options.name}.test.js`);

		render({
			input: testTemplatePath,
			output: testFilePath,
			data: {
				name: camelcase(options.name, {pascalCase: true}),
				sourceName: options.name,
			},
		});
	}

	return {
		extensionName,
		functionName: camelcase(options.name, {pascalCase: true}),
	};
}