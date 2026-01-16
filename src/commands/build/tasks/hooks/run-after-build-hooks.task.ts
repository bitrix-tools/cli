import type { Task } from '../../../../modules/task/task';
import type { BasePackage } from '../../../../modules/packages/base-package';
import { PackageResolver } from '../../../../modules/packages/package.resolver';
import { spawn } from 'node:child_process';

export function runAfterBuildHooksTask(extension: BasePackage, args: Record<string, any>): Task
{
	return {
		title: 'Run hooks...',
		run: async (context) => {
			const hooks = extension.getBundleConfig().get('hooks');
			if (Array.isArray(hooks?.afterBuild))
			{
				for await (const hook of hooks.afterBuild)
				{
					if (hook.type === 'build')
					{
						context.log(hook.title);
						for await (const extensionName of hook.extensions)
						{
							const extension = PackageResolver.resolve(extensionName);
							if (extension)
							{
								const child = spawn('bitrix', ['build'], {
									stdio: 'inherit',
									cwd: extension.getPath(),
								});

								await new Promise((resolve) => {
									child.on('close', (code) => {
										context.log(`Build ${extension.getName()}`);
										resolve(code);
									});
								});
							}
						}
					}

					if (hook.type === 'test')
					{
						for await (const extensionName of hook.extensions)
						{
							const extension = PackageResolver.resolve(extensionName);
							if (extension)
							{
								const child = spawn('bitrix', ['test'], {
									stdio: 'inherit',
									cwd: extension.getPath(),
								});

								await new Promise((resolve) => {
									child.on('close', (code) => {
										context.log(`Test ${extension.getName()}`);
										resolve(code);
									});
								});
							}
						}
					}

					if (hook.type === 'action')
					{
						context.log(hook.title);
						await hook.run();
					}
				}

				context.succeed('After build hooks completed');
			}
		},
	};
}
