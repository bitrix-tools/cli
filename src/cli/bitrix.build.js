import Ora from 'ora';
import build from '../tools/build';
import params from '../process/params';
import argv from '../process/argv';
import watch from '../tools/watch';

/*
	eslint
 	"no-restricted-syntax": "off",
 	"no-await-in-loop": "off"
*/

async function bitrixBuild({path, modules = []} = params) {
	await build(modules.length ? modules : path);

	if (argv.watch) {
		return new Promise((resolve) => {
			const progressbar = new Ora();
			const directories = modules.length ? modules : [path];

			const emitter = watch(directories)
				.on('start', (watcher) => {
					progressbar.start('Run watcher');
					resolve({watcher, emitter});
				})
				.on('ready', () => {
					progressbar.succeed('Watcher is ready'.green.bold);
				})
				.on('change', (config) => {
					void build(config.context, false);
				});
		});
	}

	return Promise.resolve();
}

export default bitrixBuild;