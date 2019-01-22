import build from '../tools/build';
import params from '../process/params';
import argv from '../process/argv';
import Ora from 'ora';
import watch from '../tools/watch';

async function bitrixBuild({ path, modules = [] } = params) {
	await build(modules.length ? modules : path);

	if (argv.watch) {
		return await new Promise((resolve) => {
			const progressbar = new Ora();
			const directories = modules.length ? modules : [path];

			const emitter = watch(directories)
				.on('start', (watcher) => {
					progressbar.start('Run watcher');
					resolve({watcher, emitter});
				})
				.on('ready', () => {
					progressbar.succeed(`Watcher is ready`.green.bold);
				})
				.on('change', (config) => {
					void build(config.context, false);
				});
		});
	}
}

export default bitrixBuild;