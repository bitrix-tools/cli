import path from 'path';
import argv from '../../../process/argv';
import Directory from '../../../entities/directory';
import test from '../../../tools/test';

// @todo refactoring

global.testsStatus = global.testsStatus || {};

export default function rollupMochaTestRunner() {
	return {
		name: 'test',
		async onwrite(bundle) {
			if (argv.test || argv.t) {
				const directory = new Directory(global.currentDirectory);
				const configs = directory.getConfigs();

				const config = configs.find(({context, output}) => (
					path.resolve(context, output).endsWith(bundle.file)
				));

				global.testsStatus[config.context] = await test(config.context);
			}
		},
	};
}