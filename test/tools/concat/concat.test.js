import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import concat from '../../../src/tools/concat';

const outputPath = path.resolve(__dirname, 'data', 'output.js');
const outputMapPath = path.resolve(__dirname, 'data', 'output.js.map');

describe('tools/concat', () => {
	afterEach(() => {
		if (fs.existsSync(outputPath))
		{
			fs.unlinkSync(outputPath);
		}

		if (fs.existsSync(outputMapPath))
		{
			fs.unlinkSync(outputMapPath);
		}
	});

	it('Should be exported as function', () => {
		assert(typeof concat === 'function');
	});

	it('Should does not throw if passed bad params', () => {
		assert.doesNotThrow(() => {
			concat();
			concat([]);
			concat([], 'test.js');
			concat('', {});
			concat({}, []);
		});
	});

	it('Should concatenate js files', () => {
		const input = [
			path.resolve(__dirname, 'data', 'source1.js'),
			path.resolve(__dirname, 'data', 'source2.js'),
			path.resolve(__dirname, 'data', 'source3.js'),
		];

		concat(input, outputPath);

		const result = fs.readFileSync(path.resolve(__dirname, 'data', 'result.js'), 'utf-8');
		const output = fs.readFileSync(outputPath, 'utf-8');

		assert(result === output);
	});
});