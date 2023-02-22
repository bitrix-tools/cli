import test from '../tools/test';
import params from '../process/params';
import argv from '../process/argv';
import Ora from 'ora';
import watch from '../tools/watch';
import 'colors';
import resolveExtension from '../utils/resolve-extension';

async function bitrixTest({path, extensions, modules = []} = params) {
	if (Array.isArray(extensions) && extensions.length > 0)
	{
		for (const extensionName of extensions) {
			const resolverResult = resolveExtension({name: extensionName, cwd: path});
			if (resolverResult)
			{
				await test(resolverResult.context);
			}
		}
	}
	else
	{
		await test(modules.length ? modules : path);
	}

	if (argv.watch) {
		return await new Promise((resolve) => {
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