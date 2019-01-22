import assert from 'assert';
import bitrixCreate from '../../../src/cli/bitrix.create';

describe('cli/bitrix.create', () => {
	it('Should be exported as function', () => {
		assert(typeof bitrixCreate === 'function');
	});
});