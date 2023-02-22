import assert from 'assert';
import path from 'path';
import resolveRootDirectoryByCwd from '../../../src/utils/resolve-root-directory-by-cwd';

const productRoot = path.join(__dirname, 'data', 'product');
const modulesRoot = path.join(__dirname, 'data', 'modules');

describe('utils/resolve-root-directory-by-cwd', () => {
	describe('Should works with modules paths', () => {
		it('Should works if passed modules extension cwd', () => {
			const cwd = path.join(modulesRoot, 'main', 'install', 'js', 'main', 'core');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: modulesRoot,
					type: 'modules',
				},
			);
		});

		it('Should works if passed modules js cwd', () => {
			const cwd = path.join(modulesRoot, 'main', 'install', 'js', 'main');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: modulesRoot,
					type: 'modules',
				},
			);
		});

		it('Should works if passed modules cwd with "local" module name', () => {
			const cwd = path.join(modulesRoot, 'local', 'install', 'js', 'local');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: modulesRoot,
					type: 'modules',
				},
			);
		});

		it('Should works if passed modules root cwd', () => {
			const cwd = path.join(modulesRoot);

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: modulesRoot,
					type: 'modules',
				},
			);
		});
	});

	describe('Should works with product paths', () => {
		it('Should works if passed local extension cwd', () => {
			const cwd = path.join(productRoot, 'local', 'js', 'main', 'app');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: productRoot,
					type: 'product',
				},
			);
		});

		it('Should works if passed local js cwd', () => {
			const cwd = path.join(productRoot, 'local', 'js');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: productRoot,
					type: 'product',
				},
			);
		});
	});

	describe('Should works with any product paths', () => {
		it('Should works if passed bitrix js cwd', () => {
			const cwd = path.join(productRoot, 'bitrix', 'js');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: productRoot,
					type: 'product',
				},
			);
		});

		it('Should works if passed public path cwd', () => {
			const cwd = path.join(productRoot, 'crm', 'deal');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: productRoot,
					type: 'product',
				},
			);
		});

		it('Should works if passed bitrix/modules path cwd', () => {
			const cwd = path.join(productRoot, 'bitrix', 'modules', 'main');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: productRoot,
					type: 'product',
				},
			);
		});

		it('Should works if passed public path cwd', () => {
			const cwd = path.join(productRoot, 'bitrix', 'components', 'bitrix', 'main.ui.grid', 'templates', '.default');

			assert.deepEqual(
				resolveRootDirectoryByCwd(cwd),
				{
					rootPath: productRoot,
					type: 'product',
				},
			);
		});
	});
});