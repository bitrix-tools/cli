import assert from 'assert';
import {describe, it} from 'mocha';
import parseComponentTemplatePath from '../../../src/path/parse-component-template-path';

describe('path/parseComponentTemplatePath', () => {
	it('Should return result if passed modules/module/install/components path', () => {
		const paths = [
			{
				path: '/repo/modules/main/install/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'bitrix',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/repo/modules/main/install/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/repo/modules/module/install/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return result if passed modules/module/install/components path', () => {
		const paths = [
			{
				path: '/repo/local/modules/main/install/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'local',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/repo/local/modules/main/install/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'local',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/repo/local/modules/module/install/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'local',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return result if passed modules/module/install/templates/../components path', () => {
		const paths = [
			{
				path: '/repo/modules/main/install/templates/testtpl/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'bitrix',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/repo/modules/main/install/templates/tpl2/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/repo/modules/module/install/templates/tpl_3/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return result if passed /bitrix/modules/module/install/templates/.../components path', () => {
		const paths = [
			{
				path: '/www/bitrix/modules/main/install/templates/testtpl/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'bitrix',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/www/bitrix/modules/main/install/templates/tpl2/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/www/bitrix/modules/module/install/templates/tpl_3/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return result if passed /local/modules/module/install/templates/.../components path', () => {
		const paths = [
			{
				path: '/www/local/modules/main/install/templates/testtpl/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'local',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/www/local/modules/main/install/templates/tpl2/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'local',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/www/local/modules/module/install/templates/tpl_3/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'local',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return result if passed /bitrix/templates/.../components path', () => {
		const paths = [
			{
				path: '/www/bitrix/templates/testtpl/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'bitrix',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/www/bitrix/templates/tpl2/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/www/bitrix/templates/tpl_3/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return result if passed /local/templates/.../components path', () => {
		const paths = [
			{
				path: '/www/local/templates/testtpl/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'local',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/www/local/templates/tpl2/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'local',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/www/local/templates/tpl_3/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'local',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return result if passed bitrix/components path', () => {
		const paths = [
			{
				path: '/www/bitrix/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'bitrix',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/www/bitrix/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/www/bitrix/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'bitrix',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return result if passed local/components path', () => {
		const paths = [
			{
				path: '/www/local/components/bitrix/news.list/templates/.default/script.js',
				result: {
					root: 'local',
					namespace: 'bitrix',
					component: 'news.list',
					template: '.default',
					filePath: 'script.js',
				},
			},
			{
				path: '/www/local/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
				result: {
					root: 'local',
					namespace: 'my-namespace',
					component: 'news_list',
					template: 'custom-tpl',
					filePath: 'src/app/app.js',
				},
			},
			{
				path: '/www/local/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
				result: {
					root: 'local',
					namespace: 'my_namespace',
					component: 'news_list',
					template: 'custom_tpl',
					filePath: 'src/app/app.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseComponentTemplatePath(item.path));
		});
	});

	it('Should return null if passed not component template path', () => {
		const paths = [
			'/www/bitrix/test/core/core.js',
			'/test/components/bitrix/news.list/templates/.default/script.js',
			'/modules2/test/install/components/bitrix/news.list/templates/.default/script.js',
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(null, parseComponentTemplatePath(item));
		});
	});
});