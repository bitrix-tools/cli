import assert from 'assert';
import box from '../../../src/tools/box';

describe('tools/box', () => {
	it('Should be exported as function', () => {
		assert(typeof box === 'function');
	});

	it('Should return string', () => {
		const result = box('test');

		assert(typeof result === 'string');
	});
});