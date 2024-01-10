import assert from 'assert';
import sinon from 'sinon';
import bitrixInfo from '../../../src/cli/bitrix.info';

describe('cli/bitrix.info', () => {
	it('Should be exported as function', () => {
		assert(typeof bitrixInfo === 'function');
	});

	it('Should print info', () => {
		const log = sinon.stub();

		bitrixInfo.__Rewire__('Logger', {log});

		bitrixInfo();

		const message = log.lastCall.args[0];

		assert.ok(message.includes('Mercurial'), 'Not includes Mercurial');
		assert.ok(message.includes('cli/src/mercurial/hooks/preupdate.sh'), 'Not includes preupdate.sh');
		assert.ok(message.includes('cli/src/mercurial/hooks/update.sh'), 'Not includes update.sh');

		assert.ok(message.includes('Update: npm update -g @bitrix/cli'), 'Not includes npm update');
		assert.ok(message.includes('Remove: npm uninstall -g @bitrix/cli'), 'Not includes npm uninstall');
	});
});
