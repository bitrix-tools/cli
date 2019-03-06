import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import render from '../../../src/tools/render';

const templatePath = path.resolve(__dirname, 'data', 'template.tpl');
const resultPath = path.resolve(__dirname, 'data', 'result.txt');
const outputPath = path.resolve(__dirname, 'data', 'output.txt');

describe('tools/render', () => {
	afterEach(() => {
		if (fs.existsSync(outputPath))
		{
			fs.unlinkSync(outputPath);
		}
	});

	it('Should be exported as function', () => {
		assert(typeof render === 'function');
	});

	it('Should render passed template', () => {
		render({
			input: templatePath,
			output: outputPath,
			data: {name: 'test'},
		});

		const result = fs.readFileSync(resultPath, 'utf-8');
		const output = fs.readFileSync(outputPath, 'utf-8');

		assert(result === output);
	});

	it('Should does not throw if passed not exists input', () => {
		assert.doesNotThrow(() => {
			render({input: ''});
		});
	});

	it('Should replace output if exists', () => {
		fs.writeFileSync(outputPath, '1111');

		render({
			input: templatePath,
			output: outputPath,
			data: {name: 'test'},
		});

		const result = fs.readFileSync(resultPath, 'utf-8');
		const output = fs.readFileSync(outputPath, 'utf-8');

		assert(result === output);
	});
});