import assert from 'assert';
import Mocha from 'mocha';
import * as sinon from 'sinon';
import * as path from 'path';
import test, { testDirectory, reporterStub, __RewireAPI__ as testDirectoryRewire } from '../../../src/tools/test';

describe('tools/test', () => {
	it('Should be exported as function', () => {
		assert(typeof test === 'function');
	});

	it('Should throws if passed invalid parameters', async () => {
		await assert.rejects(test());
		await assert.rejects(test(1));
		await assert.rejects(test(null));
		await assert.rejects(test(true));
		await assert.rejects(test(false));
		await assert.rejects(test({}));
	});

	it('Should call testDirectory with extension path and report = true', async () => {
		const extension = path.resolve(__dirname, 'data/extension');
		const testDirectoryFake = sinon.spy();

		test.__Rewire__('testDirectory', testDirectoryFake);
		test.__Rewire__('appendBootstrap', sinon.spy());

		await test(extension);

		assert(testDirectoryFake.lastCall.args[0] === extension);
		assert(testDirectoryFake.lastCall.args[1] === true);
	});

	it('Should call testDirectory with extension path and report = true', async () => {
		const extensions = [
			path.resolve(__dirname, 'data/extension'),
			path.resolve(__dirname, 'data/extension2')
		];
		const testDirectoryFake = sinon.spy();

		test.__Rewire__('testDirectory', testDirectoryFake);
		test.__Rewire__('appendBootstrap', sinon.spy());

		await test(extensions);

		testDirectoryFake.args.forEach((args, index) => {
			assert(args[0] === extensions[index]);
			assert(args[1] === true);
		});
	});

	it('Should print test result with status passed', async () => {
		const extension = [path.resolve(__dirname, 'data/extension')];
		const testDirectoryFake = sinon.fake.returns('passed');
		const logSpy = sinon.spy();

		test.__Rewire__('testDirectory', testDirectoryFake);
		test.__Rewire__('appendBootstrap', sinon.spy());
		test.__Rewire__('Logger', {log: logSpy});

		await test(extension);

		assert(logSpy.lastCall.args[1].includes('passed'));
	});

	it('Should print test result with status "failure"', async () => {
		const extension = [path.resolve(__dirname, 'data/extension')];
		const testDirectoryFake = sinon.fake.returns('failure');
		const logSpy = sinon.spy();

		test.__Rewire__('testDirectory', testDirectoryFake);
		test.__Rewire__('appendBootstrap', sinon.spy());
		test.__Rewire__('Logger', {log: logSpy});

		await test(extension);

		assert(logSpy.lastCall.args[1].includes('failed'));
	});

	it('Should print test result with status "notests"', async () => {
		const extension = [path.resolve(__dirname, 'data/extension')];
		const testDirectoryFake = sinon.fake.returns('notests');
		const logSpy = sinon.spy();

		test.__Rewire__('testDirectory', testDirectoryFake);
		test.__Rewire__('appendBootstrap', sinon.spy());
		test.__Rewire__('Logger', {log: logSpy});

		await test(extension);

		assert(logSpy.lastCall.args[1].includes('no tests'));
	});

	describe('testDirectory', () => {
		it('Should return status "notests" if passed directory without tests', async () => {
			const extension = path.resolve(__dirname, 'data/extension2');
			const result = await testDirectory(extension);

			assert(result === 'no-tests');
		});

		it('Should set global variable (temporary) currentDirectory, if passed report = false', async () => {
			const extension = path.resolve(__dirname, 'data/extension2');

			delete global.currentDirectory;

			await testDirectory(extension, false);

			assert(global.currentDirectory === extension);
		});

		it('Should return status "passed" if passed path to extension with 2 valid tests', async () => {
			const extension = path.resolve(__dirname, 'data/extension');
			const mochaStub = sinon.stub();
			const files = [];
			mochaStub.prototype.addFile = (file) => files.push(file);
			mochaStub.prototype.run = (cb) => {
				files.forEach(() => cb(false));
				return {
					on: (event, callback) => {
						callback();
					}
				}
			};

			testDirectoryRewire.__Rewire__('Mocha', mochaStub);
			testDirectoryRewire.__Rewire__('invalidateModuleCache', sinon.stub());
			testDirectoryRewire.__Rewire__('require', sinon.stub());
			testDirectoryRewire.__Rewire__('appendBootstrap', sinon.spy());

			const result = await testDirectory(extension);

			assert(files.length === 2);
			assert(result === 'passed');
		});

		it('Should return status "failed" if passed path to extension with some invalid tests', async () => {
			const extension = path.resolve(__dirname, 'data/extension');
			const mochaStub = sinon.stub();
			const files = [];
			mochaStub.prototype.addFile = (file) => files.push(file);
			mochaStub.prototype.run = (cb) => {
				files.forEach((item, index) => cb(!index));
				return {
					on: (event, callback) => {
						callback();
					}
				}
			};

			testDirectoryRewire.__Rewire__('Mocha', mochaStub);
			testDirectoryRewire.__Rewire__('invalidateModuleCache', sinon.stub());
			testDirectoryRewire.__Rewire__('require', sinon.stub());
			testDirectoryRewire.__Rewire__('appendBootstrap', sinon.spy());

			const result = await testDirectory(extension);

			assert(files.length === 2);
			assert(result === 'failed');
		});

		it('Should return status "no-tests" if passed path to extension without tests', async () => {
			const extension = path.resolve(__dirname, 'data/extension3');
			const mochaStub = sinon.stub();
			const files = [];
			mochaStub.prototype.addFile = (file) => files.push(file);
			mochaStub.prototype.run = (cb) => {
				files.forEach(() => cb(false));
				return {
					on: (event, callback) => {
						callback();
					}
				}
			};

			testDirectoryRewire.__Rewire__('Mocha', mochaStub);
			testDirectoryRewire.__Rewire__('invalidateModuleCache', sinon.stub());
			testDirectoryRewire.__Rewire__('require', sinon.stub());
			testDirectoryRewire.__Rewire__('appendBootstrap', sinon.spy());

			const result = await testDirectory(extension);

			assert(files.length === 0);
			assert(result === 'no-tests');
		});

		it('Should be call reporterStub if passed report = false', async () => {
			const extension = path.resolve(__dirname, 'data/extension');
			const mochaStub = sinon.stub();
			const reporterStub = sinon.spy();
			const files = [];
			mochaStub.prototype.addFile = (file) => files.push(file);
			mochaStub.prototype.run = (cb) => {
				files.forEach(() => cb(false));
				mochaStub.lastCall.args[0].reporter();
				return {
					on: (event, callback) => {
						callback();
					}
				}
			};

			testDirectoryRewire.__Rewire__('Mocha', mochaStub);
			testDirectoryRewire.__Rewire__('invalidateModuleCache', sinon.stub());
			testDirectoryRewire.__Rewire__('require', sinon.stub());
			testDirectoryRewire.__Rewire__('reporterStub', reporterStub);
			testDirectoryRewire.__Rewire__('appendBootstrap', sinon.spy());

			await testDirectory(extension, false);

			assert(reporterStub.called);
		});
	});

	describe('reporterStub', () => {
		it('Should be a function', () => {
			assert(typeof reporterStub === 'function');
		});
	});
});
