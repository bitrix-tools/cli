import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import ini from 'ini';
import bitrixAdjust from '../../../src/cli/bitrix.adjust';

const originalHgrcPath = path.resolve(__dirname, 'data/.hgrc.original');
const tmpDir = path.resolve(__dirname, 'data/tmp');
const backupPath = path.resolve(tmpDir, '.hgrc.backup');
const resultHgrcPath = path.resolve(tmpDir, '.hgrc');
const notExistsHgrcPath = path.resolve(tmpDir, '.hgrc.test');
const notExistsHgrcBackupPath = path.resolve(tmpDir, '.hgrc.test.backup');

describe('cli/bitrix.adjust', () => {
	beforeEach(() => cleanTmpFiles());
	afterEach(() => cleanTmpFiles());

	it('Should be exported as function', () => {
		assert(typeof bitrixAdjust === 'function');
	});

	it('Should create backup if not created', () => {
		assert(fs.existsSync(backupPath) === false);

		fs.mkdirSync(path.dirname(resultHgrcPath));
		fs.copyFileSync(originalHgrcPath, resultHgrcPath);

		bitrixAdjust({path: resultHgrcPath}, {hg: true});

		assert(fs.existsSync(backupPath) === true);
	});

	it('Should adjust hgrc by passed path', () => {
		assert(fs.existsSync(backupPath) === false);

		fs.mkdirSync(path.dirname(resultHgrcPath));
		fs.copyFileSync(originalHgrcPath, resultHgrcPath);

		bitrixAdjust({path: resultHgrcPath}, {hg: true});

		const hgrc = ini.parse(fs.readFileSync(resultHgrcPath, 'utf-8'));
		const preUpdatePath = path.resolve(__dirname, '../../../src/mercurial/hooks/preupdate.sh');
		const updatePath = path.resolve(__dirname, '../../../src/mercurial/hooks/update.sh');

		assert(hgrc.hooks['preupdate.bitrix.build.watcher'] === preUpdatePath);
		assert(hgrc.hooks['update.bitrix.build.watcher'] === updatePath);
	});

	it('Should creates .hgrc file if does not exists', () => {
		bitrixAdjust({path: notExistsHgrcPath});

		assert(fs.existsSync(path.dirname(notExistsHgrcPath)) === true);
		assert(fs.existsSync(notExistsHgrcPath) === true);

		const hgrc = ini.parse(fs.readFileSync(notExistsHgrcPath, 'utf-8'));
		const preUpdatePath = path.resolve(__dirname, '../../../src/mercurial/hooks/preupdate.sh');
		const updatePath = path.resolve(__dirname, '../../../src/mercurial/hooks/update.sh');

		assert(hgrc.hooks['preupdate.bitrix.build.watcher'] === preUpdatePath);
		assert(hgrc.hooks['update.bitrix.build.watcher'] === updatePath);
	});

	it('Should creates .hgrc file if does not exists and tmp dir is exists', () => {
		fs.mkdirSync(tmpDir);

		bitrixAdjust({path: notExistsHgrcPath}, {hg: true});

		assert(fs.existsSync(path.dirname(notExistsHgrcPath)) === true);
		assert(fs.existsSync(notExistsHgrcPath) === true);

		const hgrc = ini.parse(fs.readFileSync(notExistsHgrcPath, 'utf-8'));
		const preUpdatePath = path.resolve(__dirname, '../../../src/mercurial/hooks/preupdate.sh');
		const updatePath = path.resolve(__dirname, '../../../src/mercurial/hooks/update.sh');

		assert(hgrc.hooks['preupdate.bitrix.build.watcher'] === preUpdatePath);
		assert(hgrc.hooks['update.bitrix.build.watcher'] === updatePath);
	});

	it('Should creates .hgrc file if does not exists and .backup file exists', () => {
		fs.mkdirSync(tmpDir);
		fs.writeFileSync(notExistsHgrcBackupPath, '');

		bitrixAdjust({path: notExistsHgrcPath}, {hg: true});

		assert(fs.existsSync(path.dirname(notExistsHgrcPath)) === true);
		assert(fs.existsSync(notExistsHgrcPath) === true);

		const hgrc = ini.parse(fs.readFileSync(notExistsHgrcPath, 'utf-8'));
		const preUpdatePath = path.resolve(__dirname, '../../../src/mercurial/hooks/preupdate.sh');
		const updatePath = path.resolve(__dirname, '../../../src/mercurial/hooks/update.sh');

		assert(hgrc.hooks['preupdate.bitrix.build.watcher'] === preUpdatePath);
		assert(hgrc.hooks['update.bitrix.build.watcher'] === updatePath);
	});

	it('Should throws if required params not passed', () => {
		assert.throws(() => {
			bitrixAdjust({ path: null });
		});
	});
});

function cleanTmpFiles() {
	if (fs.existsSync(tmpDir)) {
		if (fs.existsSync(backupPath)) {
			fs.unlinkSync(backupPath);
		}

		if (fs.existsSync(resultHgrcPath)) {
			fs.unlinkSync(resultHgrcPath);
		}

		if (fs.existsSync(notExistsHgrcPath)) {
			fs.unlinkSync(notExistsHgrcPath);
		}

		if (fs.existsSync(notExistsHgrcBackupPath)) {
			fs.unlinkSync(notExistsHgrcBackupPath);
		}

		fs.rmdirSync(tmpDir);
	}
}