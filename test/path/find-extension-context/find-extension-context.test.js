import assert from 'assert';
import {describe, it} from 'mocha';
import path from 'path';
import findExtensionContext from '../../../src/path/find-extension-context';

describe('path/findExtensionContext', () => {
	it('Should return correct context for extension path', () => {
		const source = path.resolve(__dirname, 'data', 'js', 'main', 'core', 'src', 'events', 'bind.js');
		const context = path.resolve(__dirname, 'data', 'js', 'main', 'core');
		assert.strictEqual(findExtensionContext(source), context);
	});

	it('Should return null if passed invalid extension path', () => {
		const source = path.resolve(__dirname, 'data', 'js', 'main', 'core2', 'src', 'events', 'bind.js');
		assert.strictEqual(findExtensionContext(source), null);
	});
});