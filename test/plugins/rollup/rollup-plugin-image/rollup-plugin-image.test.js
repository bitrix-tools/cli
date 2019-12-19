import assert from 'assert';
import {describe, it} from 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import build from '../../../../src/tools/build';

describe('plugins/rollup/rollup-plugin-image', () => {
	it.only('Should resolve imported image', async () => {
		const extensionPath = path.resolve(__dirname, 'data', 'repo/modules/main/install/js/main/app');

		await build(extensionPath);

	});
});