import assert from 'assert';
import isEs6File from '../../../src/utils/is-es6-file';

describe('utils/is-es6-file', () => {
	it('Should be exported as function', () => {
		assert(typeof isEs6File === 'function');
	});

	it('Should return true if passed valid es6 file path', () => {
		const samples = [
			'script.es6.js',
			'/script.es6.js',
			'/test/script.es6.js',
			'\\script.es6.js',
			'\\test\\script.es6.js'
		];

		samples.forEach(entry => {
			assert(isEs6File(entry) === true);
		});
	});

	it('Should return false if passed invalid es6 file path', () => {
		const samples = [
			'script.es6.jsx',
			'/script.es6.css',
			'/test/script.es6.js/',
			'\\script.es6.jsx',
			'\\test\\script.es6.js\\',
			null,
			false,
			true,
			{},
			[]
		];

		samples.forEach(entry => {
			assert(isEs6File(entry) === false);
		});
	});
});