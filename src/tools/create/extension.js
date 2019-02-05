import * as fs from 'fs';
import camelcase from 'camelcase';
import { resolve, relative } from 'path';
import { appRoot } from '../../constants';
import buildExtensionName from '../../utils/build-extension-name';
import bitrixFlow from '../../cli/bitrix.flow';
import render from '../render';
import slash from 'slash';

const templatePath = resolve(appRoot, 'src/templates/extension');
const configTemplatePath = resolve(templatePath, 'bundle.config.js');
const inputTemplatePath = resolve(templatePath, 'input.js');
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
	const extName = buildExtensionName(inputPath, extensionPath);

	render({
		input: inputTemplatePath,
		output: inputPath,
		data: {
			name: camelcase(options.name, {pascalCase: true})
		}
	});

	render({
		input: configTemplatePath,
		output: configPath,
		data: {
			input: slash(relative(extensionPath, inputPath)),
			output: slash(relative(extensionPath, outputPath))
		}
	});

	if (options.tests) {
		const testTemplatePath = resolve(templatePath, 'test.js');
		const testFilePath = resolve(extensionPath, `test/${options.name}/${options.name}.test.js`);

		render({
			input: testTemplatePath,
			output: testFilePath,
			data: {
				name: camelcase(options.name, {pascalCase: true}),
				sourceName: options.name
			}
		});
	}

	if (options.flow) {
		bitrixFlow({path: extensionPath}, {init: true});
	}

	return {
		extName,
		functionName: camelcase(options.name, {pascalCase: true})
	};
}