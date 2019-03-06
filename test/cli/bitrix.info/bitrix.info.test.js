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

		assert(message.includes('Flow'));
		assert(message.includes('/@bitrix/cli/node_modules/flow-bin'));

		assert(message.includes('ESLint'));
		assert(message.includes('/@bitrix/cli/node_modules/eslint'));
		assert(message.includes('/@bitrix/cli/.eslintrc.js'));

		assert(message.includes('Mercurial'));
		assert(message.includes('/@bitrix/cli/src/mercurial/hooks/preupdate.sh'));
		assert(message.includes('/@bitrix/cli/src/mercurial/hooks/update.sh'));

		assert(message.includes('/@bitrix/cli/src/mercurial/hooks/preupdate.sh'));
		assert(message.includes('/@bitrix/cli/src/mercurial/hooks/update.sh'));

		assert(message.includes('Update: npm update -g @bitrix/cli'));
		assert(message.includes('Remove: npm uninstall -g @bitrix/cli'));
	});
});