import assert from 'assert';
import * as sinon from 'sinon';
import bitrixTest from '../../../src/cli/bitrix.test';
import {EventEmitter} from 'events';

describe('cli/bitrix.test', () => {
	it('Should be exported as function', () => {
		assert(typeof bitrixTest === 'function');
	});

	it('Should run test for single directory', async () => {
		const testStub = sinon.stub();
		bitrixTest.__Rewire__('test', testStub);
		bitrixTest.__Rewire__('argv', {});

		await bitrixTest({path: 'test/path'});

		assert(testStub.lastCall.args[0] === 'test/path');
	});

	it('Should run test for multiple directories', async () => {
		const testStub = sinon.stub();
		bitrixTest.__Rewire__('test', testStub);
		bitrixTest.__Rewire__('argv', {});

		await bitrixTest({
			path: 'test/path',
			modules: ['module1', 'module2']
		});

		assert(testStub.lastCall.args[0][0] === 'module1');
		assert(testStub.lastCall.args[0][1] === 'module2');
	});

	it('Should run file watcher if passed watch param in argv', async () => {
		const testStub = sinon.stub();
		const watchStub = sinon.spy(() => {
			const emitter = new EventEmitter();
			setTimeout(() => {
				emitter.emit('start', watchStub);
			}, 10);
			setTimeout(() => {
				emitter.emit('ready');
			}, 12);
			setTimeout(() => {
				emitter.emit('change', {context: 'test'});
			}, 20);
			return emitter;
		});

		bitrixTest.__Rewire__('test', testStub);
		bitrixTest.__Rewire__('Ora', class Ora { start() {} succeed() {} });
		bitrixTest.__Rewire__('watch', watchStub);
		bitrixTest.__Rewire__('argv', {watch: true});

		await bitrixTest({
			path: 'test/path',
			modules: ['module1', 'module2']
		});

		assert(watchStub.lastCall.args[0][0] === 'module1');
		assert(watchStub.lastCall.args[0][1] === 'module2');

		await new Promise((resolve) => {
			setTimeout(() => {
				assert(testStub.lastCall.args[0] === 'test');
				resolve();
			}, 50);
		});
	});
});