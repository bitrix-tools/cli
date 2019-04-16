import * as fs from 'fs';
import camelcase from 'camelcase';
import {resolve, relative} from 'path';
import slash from 'slash';
import {appRoot} from '../../constants';
import buildExtensionName from '../../utils/build-extension-name';
import render from '../render';
import buildNamespaceName from '../../utils/build-namespace-name';

const templatePath = resolve(appRoot, 'src/templates/extension');
const configTemplatePath = resolve(templatePath, 'bundle.config.js');
const inputTemplatePath = resolve(templatePath, 'input.js');
const inputFlowTemplatePath = resolve(templatePath, 'input.flow.js');
const defaultOptions = {test: true, flow: false};

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
		input: options.flow ? inputFlowTemplatePath : inputTemplatePath,
		output: inputPath,
		data: {
			name: camelcase(options.name, {pascalCase: true}),
			nameLower: `${options.name}`.toLowerCase(),
			flow: options.flow,
		},
	});

	render({
		input: configTemplatePath,
		output: configPath,
		data: {
			input: slash(relative(extensionPath, inputPath)),
			output: slash(relative(extensionPath, outputPath)),
			namespace: namespaceName,
		},
	});

	if (options.tests) {
		const testTemplatePath = resolve(templatePath, 'test.js');
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