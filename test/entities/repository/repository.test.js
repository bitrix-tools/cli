import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import Repository from '../../../src/entities/repository';

describe('entities/repository', () => {
	it('Should be exported as function', () => {
		assert(typeof Repository === 'function');
	});

	describe('entities/repository#path', () => {
		it('Should equals constructor first param', () => {
			const lockFile = path.resolve(__dirname, 'data/.lock');
			assert((new Repository(lockFile)).path === lockFile);
		});
	});

	describe('entities/repository#constructor', () => {
		it('Should create lock file if does not exists', () => {
			const lockFile = path.resolve(__dirname, 'data/tmp/.lock');

			if (fs.existsSync(lockFile)) {
				fs.unlinkSync(lockFile);
			}

			assert(fs.existsSync(lockFile) === false);

			void new Repository(lockFile);

			assert(fs.existsSync(lockFile) === true);

			if (fs.existsSync(lockFile)) {
				fs.unlinkSync(lockFile);
			}
		});

		it('Shouldn\'t replace lock file if exists', () => {
			const lockFile = path.resolve(__dirname, 'data/tmp/.lock2');

			if (fs.existsSync(lockFile)) {
				fs.unlinkSync(lockFile);
			}

			fs.writeFileSync(lockFile, 'test', 'utf-8');

			assert(fs.readFileSync(lockFile, 'utf-8') === 'test');

			void new Repository(lockFile);

			assert(fs.readFileSync(lockFile, 'utf-8') === 'test');

			if (fs.existsSync(lockFile)) {
				fs.unlinkSync(lockFile);
			}
		});
	});

	describe('entities/repository#isLocked', () => {
		it('Should return true if lock file contains a ' +
			'fragment of the path from which passed in ' +
			'parameter path begins', () => {
			const lockFile = path.resolve(__dirname, 'data/.lock');
			const repository = new Repository(lockFile);

			const samples = [
				'/directory1',
				'/directory2',
				'/directory1/test/path',
				'/directory2/test/path.js'
			];

			samples.forEach(entry => {
				assert(repository.isLocked(entry) === true);
			});
		});

		it('Should return true if lock file contains a ' +
			'fragment of the path from which passed in ' +
			'parameter path begins (Windows like paths)', () => {
			const lockFile = path.resolve(__dirname, 'data/.lock-windows');
			const repository = new Repository(lockFile);

			const samples = [
				'\\directory1',
				'\\directory2',
				'\\directory1\\test\\path',
				'\\directory2\\test\\path.js'
			];

			samples.forEach(entry => {
				assert(repository.isLocked(entry) === true);
			});
		});

		it('Should return false if lock file not contains passed path', () => {
			const lockFile = path.resolve(__dirname, 'data/.lock');
			const repository = new Repository(lockFile);

			const samples = [
				'/test/file.js',
				'/test/file/directory',
				'/test/file/directory1',
				'/test/file/directory2/test.css',
			];

			samples.forEach(entry => {
				assert(repository.isLocked(entry) === false);
			});
		});
	});
});