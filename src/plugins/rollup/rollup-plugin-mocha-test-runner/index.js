import argv from '../../../process/argv';
import Directory from '../../../entities/directory';
import path from 'path';
import test from '../../../tools/test';

// @todo refactoring

global.testsStatus = global.testsStatus || {};

export default function rollupMochaTestRunner(options = {}) {
	return {
		name: 'test',
		async onwrite(bundle) {
			if (argv.test || argv.t) {
				const directory = new Directory(global.currentDirectory);
				const configs = directory.getConfigs();

				let config = configs.find(({ context, output }) => {
					return path.resolve(context, output).endsWith(bundle.file);
				});

				global.testsStatus[config.context] = await test(config.context);
			}
		}
	}
}