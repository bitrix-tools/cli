import fs from 'fs';
import path from 'path';
import assert from 'assert';
import resolveExtension from '../../../src/utils/resolve-extension';

const productRoot = path.join(__dirname, 'data', 'product');
const modulesRoot = path.join(__dirname, 'data', 'modules');

describe('utils/resolve-extension', () => {
	describe('Works with /local', () => {
		it('Should resolve extension from local', () => {
			const resolverResult = resolveExtension({
				name: 'app.layout',
				sourcePath: path.join(productRoot, 'local', 'js', 'myapp', 'layout', 'src', 'layout.js'),
			});

			assert.equal(
				resolverResult.context,
				path.join(productRoot, 'local', 'js', 'app', 'layout'),
				'Invalid context path',
			);

			assert.ok(
				fs.existsSync(resolverResult.context),
				'Context dir does not exists',
			);

			assert.equal(
				resolverResult.input,
				path.join(productRoot, 'local', 'js', 'app', 'layout', 'src', 'layout.js'),
				'Invalid input path',
			);

			assert.ok(
				fs.existsSync(resolverResult.input),
				'Input file does not exists',
			);

			assert.equal(
				resolverResult.bundleConfig,
				path.join(productRoot, 'local', 'js', 'app', 'layout', 'bundle.config.js'),
				'Invalid bundle.config.js path',
			);

			assert.ok(
				fs.existsSync(resolverResult.bundleConfig),
				'bundle.config.js does not exists',
			);
		});

		it('Should resolve extension from /bitrix/js', () => {
			const resolverResult = resolveExtension({
				name: 'main.core',
				sourcePath: path.join(productRoot, 'local', 'js', 'myapp', 'layout', 'src', 'layout.js'),
			});

			assert.equal(
				resolverResult.context,
				path.join(productRoot, 'bitrix', 'js', 'main', 'core'),
				'Invalid context path',
			);

			assert.ok(
				fs.existsSync(resolverResult.context),
				'Context dir does not exists',
			);

			assert.equal(
				resolverResult.input,
				path.join(productRoot, 'bitrix', 'js', 'main', 'core', 'src', 'core.js'),
				'Invalid input path',
			);

			assert.ok(
				fs.existsSync(resolverResult.input),
				'Input file does not exists',
			);

			assert.equal(
				resolverResult.bundleConfig,
				path.join(productRoot, 'bitrix', 'js', 'main', 'core', 'bundle.config.js'),
				'Invalid bundle.config.js path',
			);

			assert.ok(
				fs.existsSync(resolverResult.bundleConfig),
				'bundle.config.js does not exists',
			);
		});

		it('Should resolve extension first /local', () => {
			const resolverResult = resolveExtension({
				name: 'main.app',
				sourcePath: path.join(productRoot, 'local', 'js', 'myapp', 'layout', 'src', 'layout.js'),
			});

			assert.equal(
				resolverResult.context,
				path.join(productRoot, 'local', 'js', 'main', 'app'),
				'Invalid context path',
			);

			assert.ok(
				fs.existsSync(resolverResult.context),
				'Context dir does not exists',
			);

			assert.equal(
				resolverResult.input,
				path.join(productRoot, 'local', 'js', 'main', 'app', 'src', 'app.js'),
				'Invalid input path',
			);

			assert.ok(
				fs.existsSync(resolverResult.input),
				'Input file does not exists',
			);

			assert.equal(
				resolverResult.bundleConfig,
				path.join(productRoot, 'local', 'js', 'main', 'app', 'bundle.config.js'),
				'Invalid bundle.config.js path',
			);

			assert.ok(
				fs.existsSync(resolverResult.bundleConfig),
				'bundle.config.js does not exists',
			);
		});

		it('Should return null if extension does not exists', () => {
			const resolverResult = resolveExtension({
				name: 'main.app.test',
				sourcePath: path.join(productRoot, 'local', 'js', 'myapp', 'layout', 'src', 'layout.js'),
			});

			assert.ok(resolverResult === null);
		});
	});

	describe('Works with /modules', () => {
		it('Should resolve extension from /modules', () => {
			const resolverResult = resolveExtension({
				name: 'main.core.events',
				sourcePath: path.join(modulesRoot, 'main', 'install', 'js', 'main', 'core', 'src', 'core.js'),
			});

			assert.equal(
				resolverResult.context,
				path.join(modulesRoot, 'main', 'install', 'js', 'main', 'core', 'events'),
				'Invalid context path',
			);

			assert.ok(
				fs.existsSync(resolverResult.context),
				'Context dir does not exists',
			);

			assert.equal(
				resolverResult.input,
				path.join(modulesRoot, 'main', 'install', 'js', 'main', 'core', 'events', 'src', 'events.js'),
				'Invalid input path',
			);

			assert.ok(
				fs.existsSync(resolverResult.input),
				'Input file does not exists',
			);

			assert.equal(
				resolverResult.bundleConfig,
				path.join(modulesRoot, 'main', 'install', 'js', 'main', 'core', 'events', 'bundle.config.js'),
				'Invalid bundle.config.js path',
			);

			assert.ok(
				fs.existsSync(resolverResult.bundleConfig),
				'bundle.config.js does not exists',
			);
		});

		it('Should resolve extension from /modules only', () => {
			const resolverResult = resolveExtension({
				name: 'main.app',
				sourcePath: path.join(modulesRoot, 'main', 'install', 'js', 'main', 'core', 'src', 'core.js'),
			});

			assert.equal(
				resolverResult.context,
				path.join(modulesRoot, 'main', 'install', 'js', 'main', 'app'),
				'Invalid context path',
			);

			assert.ok(
				fs.existsSync(resolverResult.context),
				'Context dir does not exists',
			);

			assert.equal(
				resolverResult.input,
				path.join(modulesRoot, 'main', 'install', 'js', 'main', 'app', 'src', 'app.js'),
				'Invalid input path',
			);

			assert.ok(
				fs.existsSync(resolverResult.input),
				'Input file does not exists',
			);

			assert.equal(
				resolverResult.bundleConfig,
				path.join(modulesRoot, 'main', 'install', 'js', 'main', 'app', 'bundle.config.js'),
				'Invalid bundle.config.js path',
			);

			assert.ok(
				fs.existsSync(resolverResult.bundleConfig),
				'bundle.config.js does not exists',
			);
		});

		it('Should return null if extension does not exists', () => {
			const resolverResult = resolveExtension({
				name: 'main.app.test',
				sourcePath: path.join(modulesRoot, 'main', 'install', 'js', 'main', 'core', 'src', 'core.js'),
			});

			assert.ok(resolverResult === null);
		});
	});
});