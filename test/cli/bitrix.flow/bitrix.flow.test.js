import assert from 'assert';
import bitrixFlow from '../../../src/cli/bitrix.flow';
import * as path from 'path';
import * as fs from 'fs';
import rimraf from 'rimraf';

const dataPath = path.resolve(__dirname, 'data');
const flowTypedPath = path.resolve(dataPath, 'flow-typed');
const flowConfigPath = path.resolve(dataPath, '.flowconfig');

function clearData() {
	if (fs.existsSync(flowConfigPath)) {
		fs.unlinkSync(flowConfigPath);
	}

	if (fs.existsSync(flowTypedPath)) {
		rimraf.sync(flowTypedPath);
	}
}

describe('cli/bitrix.flow', () => {
	beforeEach(clearData);
	afterEach(clearData);

	it('Should be exported as function', () => {
		assert(typeof bitrixFlow === 'function');
	});

	it('Should creates symlink to .flowconfig and flow-typed dir. With argv.path', () => {
		assert(fs.existsSync(flowConfigPath) === false);
		assert(fs.existsSync(flowTypedPath) === false);

		bitrixFlow({path: dataPath}, {init: true});

		assert(fs.existsSync(flowConfigPath) === true);
		assert(fs.existsSync(flowTypedPath) === true);
	});
});