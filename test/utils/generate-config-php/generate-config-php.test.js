import assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import generateConfigPhp from '../../../src/utils/generate-config-php';

describe('utils/generate-config-php', () => {
	it('Should be exported as function', () => {
		assert(typeof generateConfigPhp === 'function');
	});

	it('Should throws if config is not object', () => {
		assert.throws(() => {
			generateConfigPhp();
		});

		assert.throws(() => {
			generateConfigPhp(1);
		});

		assert.throws(() => {
			generateConfigPhp(true);
		});

		assert.throws(() => {
			generateConfigPhp([]);
		});
	});

	it('Should return config if passed valid config without rel', () => {
		const config = {
			input: 'loader.js',
			output: {
				js: 'loader.bundle.js',
				css: 'loader.bundle.css',
			},
			context: '/modules/main/install/js/main/loader',
			rel: [
				'main.polyfill.core',
			]
		};

		const resultConfigPath = path.resolve(__dirname, './data/config-without-rel.php');
		const resultConfig = fs.readFileSync(resultConfigPath, 'utf-8');

		let result = generateConfigPhp(config);

		assert.deepStrictEqual(result, resultConfig);
	});

	it('Should return config if passed valid config without rel (windows like paths)', () => {
		const config = {
			input: 'loader.js',
			output: {
				js: 'loader.bundle.js',
				css: 'loader.bundle.css',
			},
			context: '\\modules\\main\\install\\js\\main\\loader',
			rel: [
				'main.polyfill.core',
			]
		};

		const resultConfigPath = path.resolve(__dirname, './data/config-without-rel.php');
		const resultConfig = fs.readFileSync(resultConfigPath, 'utf-8');

		let result = generateConfigPhp(config);

		assert.deepStrictEqual(result, resultConfig);
	});

	it('Should return config if passed valid config with rel', () => {
		const config = {
			input: 'loader.js',
			output: {
				js: 'loader.bundle.js',
				css: 'loader.bundle.css',
			},
			context: '/modules/main/install/js/main/loader',
			rel: [
				'main.polyfill.core',
				'main.loader',
				'ui.buttons'
			]
		};

		const resultConfigPath = path.resolve(__dirname, './data/config-with-rel.php');
		const resultConfig = fs.readFileSync(resultConfigPath, 'utf-8');

		let result = generateConfigPhp(config);

		assert.deepStrictEqual(result, resultConfig);
	});

	it('Should throws if config is invalid', () => {
		assert.throws(() => {
			generateConfigPhp({input: true, output: true, context: true});
		});

		assert.throws(() => {
			generateConfigPhp({input: 1, output: 1, context: 1});
		});

		assert.throws(() => {
			generateConfigPhp({input: '/', output: '/', context: '/', rel: true});
		});

		assert.throws(() => {
			generateConfigPhp({input: '/', output: '/', context: '/', rel: 'test'});
		});

		assert.throws(() => {
			generateConfigPhp({input: [], output: [], context: [], rel: {}});
		});
	});
});