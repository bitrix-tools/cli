import assert from 'assert';
import sinon from 'sinon';
import bitrixUnhandledCommand from '../../../src/cli/bitrix.unhandled';

describe('cli/bitrix.unhandled', () => {
	it('Should be exported as function', () => {
		assert(typeof bitrixUnhandledCommand === 'function');
	});

	it('Should print help if passed param help = true', () => {
		const helpStub = sinon.stub();
		bitrixUnhandledCommand.__Rewire__('help', helpStub);

		bitrixUnhandledCommand({help: true});

		assert(helpStub.calledOnce);
	});

	it('Should print version if passed param version = true', () => {
		const log = sinon.stub();
		bitrixUnhandledCommand.__Rewire__('Logger', {log});

		bitrixUnhandledCommand({version: true});

		assert(log.lastCall.args[0].includes('@bitrix/cli'));
	});

	it('Should print warning in command unknown', () => {
		const log = sinon.stub();
		bitrixUnhandledCommand.__Rewire__('Logger', {log});

		bitrixUnhandledCommand();

		assert(log.lastCall.args[0].includes('Unknown command.'));
	});
});