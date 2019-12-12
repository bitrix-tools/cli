import assert from 'assert';
import {describe, it} from 'mocha';
import parseComponentTemplatePath from '../../../src/path/parse-component-template-path';

describe('path/parseComponentTemplatePath', () => {
	it.only('Should return result if passed module/install/components path', () => {
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
			// {
			// 	path: '/repo/modules/main/install/components/my-namespace/news_list/templates/custom-tpl/src/app/app.js',
			// 	result: {
			// 		root: 'bitrix',
			// 		namespace: 'my-namespace',
			// 		component: 'news_list',
			// 		template: 'custom-tpl',
			// 		filePath: 'src/app/app.js',
			// 	},
			// },
			// {
			// 	path: '/repo/modules/module/install/components/my_namespace/news_list/templates/custom_tpl/src/app/app.js',
			// 	result: {
			// 		root: 'bitrix',
			// 		namespace: 'my_namespace',
			// 		component: 'news_list',
			// 		template: 'custom_tpl',
			// 		filePath: 'src/app/app.js',
			// 	},
			// },
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
});