import * as path from 'node:path';
import { BasePackage } from '../../../modules/packages/base-package';
import { Task, TaskContext } from '../../../modules/task/task';
import { hgRename } from '../../../utils/vcs/hg/rename';

export function renameFileTask(extension: BasePackage, file: string): Task
{
	const tsName = file.replace(/\.js$/, '.ts');
	const relativeJsFilePath = path.relative(extension.getPath(), file);
	const relativeTsFilePath = path.relative(extension.getPath(), tsName);

	return {
		title: `Rename file: ${relativeJsFilePath} ...`,
		run: async (context: TaskContext): Promise<void> => {
			const renameResult = await hgRename(file, tsName);
			if (renameResult.status === 'ok')
			{
				context.succeed(`File renamed: ${relativeJsFilePath} --> ${relativeTsFilePath}`);
			}
			else
			{
				context.fail(`Rename failed: ${relativeJsFilePath}`);
			}
		},
	};
}
