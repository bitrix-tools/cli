import assert from 'assert';
import isAllowed from '../../../src/utils/is-allowed';

describe('utils/is-allowed', () => {
	it('Should be exported as function', () => {
		assert(typeof isAllowed === 'function');
	});

	it('Should return false if invalid type path', () => {
		assert(isAllowed() === false);
		assert(isAllowed(null) === false);
		assert(isAllowed('') === false);
		assert(isAllowed(2) === false);
		assert(isAllowed({}) === false);
		assert(isAllowed([]) === false);
	});

	it('Should return true if passed valid and allowed path', () => {
		const samples = [
			'test/test.js',
			'test/test.jsx',
			'test/test.css',
			'test/test.scss',

			'test\\test.js',
			'test\\test.jsx',
			'test\\test.css',
			'test\\test.scss'
		];

		samples.forEach(entry => {
			assert(isAllowed(entry) === true);
		});
	});

	it('Should return false if passed valid and not allowed path', () => {
		const samples = [
			'test/script.mjs',
			'test/script.xml',
			'test/script.doc',
			'test/script.php',
			'test/script.jsphp',
			'test/script.phpjs',
			'test/script.js.map',
			'test/script.css.map',
			'test/script.scss.map',
			'bitrix/components/bitrix/main.ui.filter/templates/.default/style.js',
			'bitrix/components/bitrix/main.ui.filter/templates/.default/style.css',

			'test\\script.mjs',
			'test\\script.xml',
			'test\\script.doc',
			'test\\script.php',
			'test\\script.jsphp',
			'test\\script.phpjs',
			'test\\script.js.map',
			'test\\script.css.map',
			'test\\script.scss.map',
			'bitrix\\components\\bitrix\\main.ui.filter\\templates\\.default\\style.js',
			'bitrix\\components\\bitrix\\main.ui.filter\\templates\\.default\\style.css'
		];

		samples.forEach(entry => {
			assert(isAllowed(entry) === false);
		});
	});
});