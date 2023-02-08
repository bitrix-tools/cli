import fs from 'fs';
import camelcase from 'camelcase';
import path from 'path';
import slash from 'slash';
import {appRoot} from '../../constants';
import buildExtensionName from '../../utils/build-extension-name';
import render from '../render';
import buildNamespaceName from '../../utils/build-namespace-name';

const templatePath = path.resolve(appRoot, 'src/templates');
const extensionTemplatePath = path.resolve(templatePath, 'extension');
const configTemplatePath = path.resolve(extensionTemplatePath, 'bundle.config.js');
const inputTemplatePath = path.resolve(extensionTemplatePath, 'input.js');
const defaultOptions = {test: true};

export default function createExtension(directory, options = defaultOptions) {
	if (typeof directory !== 'string') {
		throw new Error('directory is not string');
	}

	if (!fs.existsSync(directory)) {
		throw new Error('directory is not exists');
	}

	const extensionPath = path.resolve(directory, options.name.toLowerCase());
	const inputPath = path.resolve(extensionPath, `src/${options.name}.js`);
	const outputPath = path.resolve(extensionPath, `dist/${options.name}.bundle.js`);
	const configPath = path.resolve(extensionPath, 'bundle.config.js');
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
			input: slash(path.relative(extensionPath, inputPath)),
			output: slash(path.relative(extensionPath, outputPath)),
			namespace: namespaceName,
			additionalOptions,
		},
	});

	if (options.tests) {
		const testTemplatePath = path.resolve(extensionTemplatePath, 'test.js');
		const testFilePath = path.resolve(extensionPath, `test/${options.name}/${options.name}.test.js`);

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