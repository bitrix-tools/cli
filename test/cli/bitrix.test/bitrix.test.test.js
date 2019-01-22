import assert from 'assert';
import bitrixTest from '../../../src/cli/bitrix.test';

describe('cli/bitrix.test', () => {
	it('Should be exported as function', () => {
		assert(typeof bitrixTest === 'function');
	});
});