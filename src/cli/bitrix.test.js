import test from '../tools/test';
import params from '../process/params';
import argv from '../process/argv';
import Ora from 'ora';
import watch from '../tools/watch';
import 'colors';

async function bitrixTest({ path, modules = [] } = params) {
	await test(modules.length ? modules : path);

	if (argv.watch) {
		return await new Promise((resolve) => {
			const progressbar = new Ora();
			const directories = modules.length ? modules : [path];

			const emitter = watch(directories)
				.on('start', (watcher) => {
					progressbar.start('Run test watcher');
					resolve({watcher, emitter});
				})
				.on('ready', () => {
					progressbar.succeed(`Test watcher is ready`.green.bold);
				})
				.on('change', (config) => {
					void test(config.context);
				});
		});
	}
}

export default bitrixTest;