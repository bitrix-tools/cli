import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as constants from '../../../src/constants';

describe('constants', () => {
	describe('appRoot', () => {
		it('Should be a correct app path', () => {
			const distPath = path.resolve(constants.appRoot, 'dist');
			const binPath = path.resolve(constants.appRoot, 'bin');

			assert(fs.existsSync(distPath));
			assert(fs.existsSync(binPath));
		});
	});

	describe('lockFile', () => {
		it('Should be a path to .bitrix.lock file', () => {
			const lockFile = path.resolve(os.homedir(), '.bitrix.lock');

			assert(constants.lockFile === lockFile);
		});
	});
});