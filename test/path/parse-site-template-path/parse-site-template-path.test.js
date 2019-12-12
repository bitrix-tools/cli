import assert from 'assert';
import {describe, it} from 'mocha';
import parseSiteTemplatePath from '../../../src/path/parse-site-template-path';

describe('path/parseSiteTemplatePath', () => {
	it('Should return result if passed /../modules/module/install/templates/../', () => {
		const paths = [
			{
				path: '/repo/modules/main/install/templates/.default/script.js',
				result: {
					root: 'bitrix',
					template: '.default',
					filePath: 'script.js',
				}
			},
			{
				path: '/repo/modules/main/install/templates/custom_template/src/app/app.js',
				result: {
					root: 'bitrix',
					template: 'custom_template',
					filePath: 'src/app/app.js',
				}
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseSiteTemplatePath(item.path));
		});
	});

	it('Should return result if passed /local/modules/module/install/templates/../', () => {
		const paths = [
			{
				path: '/www/local/modules/main/install/templates/.default/script.js',
				result: {
					root: 'local',
					template: '.default',
					filePath: 'script.js',
				}
			},
			{
				path: '/www/local/modules/main/install/templates/custom_template/src/app/app.js',
				result: {
					root: 'local',
					template: 'custom_template',
					filePath: 'src/app/app.js',
				}
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseSiteTemplatePath(item.path));
		});
	});

	it('Should return result if passed /bitrix/templates/../', () => {
		const paths = [
			{
				path: '/www/bitrix/templates/.default/script.js',
				result: {
					root: 'bitrix',
					template: '.default',
					filePath: 'script.js',
				}
			},
			{
				path: '/www/bitrix/templates/custom_template/src/app/app.js',
				result: {
					root: 'bitrix',
					template: 'custom_template',
					filePath: 'src/app/app.js',
				}
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseSiteTemplatePath(item.path));
		});
	});

	it('Should return result if passed /local/templates/../', () => {
		const paths = [
			{
				path: '/www/local/templates/.default/script.js',
				result: {
					root: 'local',
					template: '.default',
					filePath: 'script.js',
				}
			},
			{
				path: '/www/local/templates/custom_template/src/app/app.js',
				result: {
					root: 'local',
					template: 'custom_template',
					filePath: 'src/app/app.js',
				}
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseSiteTemplatePath(item.path));
		});
	});
});