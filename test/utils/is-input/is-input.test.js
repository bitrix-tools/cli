import assert from 'assert';
import * as path from 'path';
import isInput from '../../../src/utils/is-input';

describe('utils/is-input', () => {
	it('Should be exported as function', () => {
		assert(typeof isInput === 'function');
	});

	it('Should return true if passed valid input file path', () => {
		const context = path.resolve(__dirname, 'data');

		const samples = [
			path.resolve(context, 'extension/src/app.js'),
			path.resolve(context, 'extension/src/component.js'),
			path.resolve(context, 'extension/src/main.css'),
			path.resolve(context, 'extension/src/test.js'),
			path.resolve(context, 'extension/bundle.config.js')
		];

		samples.forEach(entry => {
			assert(isInput(context, entry) === true);
		});
	});

	it('Should return false if passed invalid input file path', () => {
		const context = path.resolve(__dirname, 'data');

		const samples = [
			path.resolve(context, 'extension/dist/app.bundle.js'),
			path.resolve(context, 'extension/dist/app.bundle.css'),
			path.resolve(context, 'extension/dist/app.bundle.js.map'),
			path.resolve(context, 'extension/dist/app.bundle.css.map')
		];

		samples.forEach(entry => {
			assert(isInput(context, entry) === false);
		});
	});
});