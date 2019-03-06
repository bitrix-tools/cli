import assert from 'assert';
import sinon from 'sinon';
import bitrixSettings from '../../../src/cli/bitrix.settings';

describe('cli/bitrix.settings', () => {
	it('Should be exported as function', () => {
		assert(typeof bitrixSettings === 'function');
	});

	it('Should print intro', async () => {
		const log = sinon.stub();

		bitrixSettings.__Rewire__('Logger', {log});
		bitrixSettings.__Rewire__('bitrixAdjust', () => {});
		bitrixSettings.__Rewire__('argv', {intro: true});
		bitrixSettings.__Rewire__('ask', () => {
			return Promise.resolve({
				hg: true,
				adjustType: 'all',
			});
		});

		await bitrixSettings();

		assert(log.firstCall.args[0].includes('@bitrix/cli installed'));
		assert(log.firstCall.args[0].includes('Answer a few questions'));
	});

	it('Should update global .hgrc if selected update for all', async () => {
		const log = sinon.stub();
		const adjustStub = sinon.stub();

		bitrixSettings.__Rewire__('Logger', {log});
		bitrixSettings.__Rewire__('bitrixAdjust', adjustStub);
		bitrixSettings.__Rewire__('argv', {intro: true});
		bitrixSettings.__Rewire__('ask', () => {
			return Promise.resolve({
				hg: true,
				adjustType: 'all',
			});
		});

		await bitrixSettings();

		assert(adjustStub.lastCall.args[0].silent);
		assert(adjustStub.lastCall.args[0].path.endsWith('.hgrc'));
	});

	it('Should update specified .hgrc if selected update for specified repository', async () => {
		const log = sinon.stub();
		const adjustStub = sinon.stub();

		bitrixSettings.__Rewire__('Logger', {log});
		bitrixSettings.__Rewire__('bitrixAdjust', adjustStub);
		bitrixSettings.__Rewire__('argv', {intro: true});
		bitrixSettings.__Rewire__('ask', () => {
			return Promise.resolve({
				hg: true,
				adjustType: 'specified',
				path: 'test/.hgrc'
			});
		});

		await bitrixSettings();

		assert(adjustStub.lastCall.args[0].silent);
		assert(adjustStub.lastCall.args[0].path.endsWith('.hgrc'));
	});
});

