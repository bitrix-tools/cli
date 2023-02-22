import Ora from 'ora';
import build from '../tools/build';
import params from '../process/params';
import argv from '../process/argv';
import watch from '../tools/watch';
import resolveExtension from '../utils/resolve-extension';

/*
	eslint
 	"no-restricted-syntax": "off",
 	"no-await-in-loop": "off"
*/

async function bitrixBuild({path, extensions, modules = []} = params) {
	if (Array.isArray(extensions) && extensions.length > 0)
	{
		for (const extensionName of extensions) {
			const resolverResult = resolveExtension({name: extensionName, cwd: path});
			if (resolverResult)
			{
				await build(resolverResult.context, false);
			}
		}
	}
	else
	{
		await build(modules.length ? modules : path);
	}

	if (argv.watch) {
		return new Promise((resolve) => {
			const progressbar = new Ora();

			const directories = (() => {
				if (
					modules.length > 0
					&& (
						!Array.isArray(extensions)
						|| extensions.length === 0
					)
				)
				{
					return modules;
				}

				if (Array.isArray(extensions) && extensions.length > 0)
				{
					return extensions.reduce((acc, extensionName) => {
						const resolverResult = resolveExtension({name: extensionName, cwd: path});
						if (resolverResult)
						{
							acc.push(resolverResult.context);
						}

						return acc;
					}, []);
				}

				return [path];
			})();

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