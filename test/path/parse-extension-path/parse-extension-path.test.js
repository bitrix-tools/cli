import assert from 'assert';
import {describe, it} from 'mocha';
import parseExtensionPath from '../../../src/path/parse-extension-path';

describe('path/parseExtensionPath', () => {
	it('Should return result if passed valid module install path', () => {
		const paths = [
			{
				path: '/www/bitrix/modules/main/install/js/main/core/core.js',
				result: {
					root: 'bitrix',
					module: 'main',
					jsDir: 'main',
					extension: ['core'],
					filePath: 'core.js',
				},
			},
			{
				path: '/www/bitrix/modules/main/install/js/main/core/events/event.js',
				result: {
					root: 'bitrix',
					module: 'main',
					jsDir: 'main',
					extension: ['core', 'events'],
					filePath: 'event.js',
				},
			},
			{
				path: '/www/bitrix/modules/ui/install/js/ui/draggable/draggable.js',
				result: {
					root: 'bitrix',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: '/www/local/modules/ui/install/js/ui/draggable/draggable.js',
				result: {
					root: 'local',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: '/bitrix/modules/ui/install/js/ui/draggable/sensor/touch/touch.js',
				result: {
					root: 'bitrix',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable', 'sensor', 'touch'],
					filePath: 'touch.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseExtensionPath(item.path));
		});
	});

	it('Should return result if passed repository path', () => {
		const paths = [
			{
				path: '/www/test/modules/main/install/js/main/core/core.js',
				result: {
					root: 'bitrix',
					module: 'main',
					jsDir: 'main',
					extension: ['core'],
					filePath: 'core.js',
				},
			},
			{
				path: '/www/repo/modules/main/install/js/main/core/events/event.js',
				result: {
					root: 'bitrix',
					module: 'main',
					jsDir: 'main',
					extension: ['core', 'events'],
					filePath: 'event.js',
				},
			},
			{
				path: '/www/modules/modules/ui/install/js/ui/draggable/draggable.js',
				result: {
					root: 'bitrix',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: '/www/bitrix24/modules/ui/install/js/ui/draggable/draggable.js',
				result: {
					root: 'bitrix',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: '/app/modules/ui/install/js/ui/draggable/sensor/touch/touch.js',
				result: {
					root: 'bitrix',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable', 'sensor', 'touch'],
					filePath: 'touch.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseExtensionPath(item.path));
		});
	});

	it('Should return result if passed local js path', () => {
		const paths = [
			{
				path: '/www/local/js/main/core/core.js',
				result: {
					root: 'local',
					module: 'main',
					jsDir: 'main',
					extension: ['core'],
					filePath: 'core.js',
				},
			},
			{
				path: '/www/local/js/main/core/events/event.js',
				result: {
					root: 'local',
					module: 'main',
					jsDir: 'main',
					extension: ['core', 'events'],
					filePath: 'event.js',
				},
			},
			{
				path: '/www/local/js/ui/draggable/draggable.js',
				result: {
					root: 'local',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: '/www/local/js/ui/draggable/draggable.js',
				result: {
					root: 'local',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: '/app/local/js/ui/draggable/sensor/touch/touch.js',
				result: {
					root: 'local',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable', 'sensor', 'touch'],
					filePath: 'touch.js',
				},
			},
		];

		paths.forEach((item) => {
			assert.deepStrictEqual(item.result, parseExtensionPath(item.path));
		});
	});

	it('Should return null if passed invalid path', () => {
		const paths = [
			'/bitrix/modules/ui/install/test/ui/draggable/sensor/touch/touch.js',
			'/bitrix/modules/ui/install2/test/ui/draggable/sensor/touch/touch.js',
		];

		paths.forEach((path) => {
			assert.strictEqual(null, parseExtensionPath(path));
		});
	});
});