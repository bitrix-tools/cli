import assert from 'assert';
import {describe, it} from 'mocha';
import * as path from 'path';
import parseExtensionPath from '../../../src/path/parse-extension-path';

describe('path/parseExtensionPath', () => {
	it('Should return result if passed valid module install path', () => {
		const paths = [
			{
				path: path.resolve(__dirname, 'data', 'bitrix/modules/main/install/js/main/core/core.js'),
				result: {
					root: 'bitrix',
					module: 'main',
					jsDir: 'main',
					extension: ['core'],
					filePath: 'core.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'bitrix/modules/main/install/js/main/core/events/event.js'),
				result: {
					root: 'bitrix',
					module: 'main',
					jsDir: 'main',
					extension: ['core', 'events'],
					filePath: 'event.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'bitrix/modules/ui/install/js/ui/draggable/draggable.js'),
				result: {
					root: 'bitrix',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'local/modules/ui/install/js/ui/draggable/draggable.js'),
				result: {
					root: 'local',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'bitrix/modules/ui/install/js/ui/draggable/sensor/touch/touch.js'),
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
				path: path.resolve(__dirname, 'data', 'repo/modules/main/install/js/main/core/core.js'),
				result: {
					root: 'bitrix',
					module: 'main',
					jsDir: 'main',
					extension: ['core'],
					filePath: 'core.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'repo/modules/main/install/js/main/core/events/event.js'),
				result: {
					root: 'bitrix',
					module: 'main',
					jsDir: 'main',
					extension: ['core', 'events'],
					filePath: 'event.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'repo/modules/modules/ui/install/js/ui/draggable/draggable.js'),
				result: {
					root: 'bitrix',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'www/bitrix24/modules/ui/install/js/ui/draggable/draggable.js'),
				result: {
					root: 'bitrix',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'app/modules/ui/install/js/ui/draggable/sensor/touch/touch.js'),
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
				path: path.resolve(__dirname, 'data', 'www/local/js/main/core/core.js'),
				result: {
					root: 'local',
					module: 'main',
					jsDir: 'main',
					extension: ['core'],
					filePath: 'core.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'www/local/js/main/core/events/event.js'),
				result: {
					root: 'local',
					module: 'main',
					jsDir: 'main',
					extension: ['core', 'events'],
					filePath: 'event.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'www/local/js/ui/draggable/draggable.js'),
				result: {
					root: 'local',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'www/local/js/ui/draggable/draggable.js'),
				result: {
					root: 'local',
					module: 'ui',
					jsDir: 'ui',
					extension: ['draggable'],
					filePath: 'draggable.js',
				},
			},
			{
				path: path.resolve(__dirname, 'data', 'app/local/js/ui/draggable/sensor/touch/touch.js'),
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
			path.resolve(__dirname, 'data', 'bitrix/modules/ui/install/test/ui/draggable/sensor/touch/touch.js'),
			path.resolve(__dirname, 'data', 'bitrix/modules/ui/install2/test/ui/draggable/sensor/touch/touch.js'),
		];

		paths.forEach((path) => {
			assert.strictEqual(null, parseExtensionPath(path));
		});
	});
});