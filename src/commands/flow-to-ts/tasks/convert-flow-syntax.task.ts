import * as path from 'node:path';
import * as fs from 'fs/promises';
import { BasePackage } from '../../../modules/packages/base-package';
import { Task, TaskContext } from '../../../modules/task/task';
import { convertFlowToTs } from '../../../utils/flow-to-ts';

export function convertFlowSyntaxTask(extension: BasePackage, file: string): Task
{
	const relativeTsFilePath = path.relative(extension.getPath(), file);

	return {
		title: `Convert file: ${relativeTsFilePath} ...`,
		run: async (context: TaskContext): Promise<void> => {
			const sourceCode = await fs.readFile(file, 'utf8');
			const typeScriptCode = await convertFlowToTs(sourceCode);

			await fs.writeFile(file, typeScriptCode, 'utf8');

			context.succeed(`File converted: ${relativeTsFilePath}`);
		},
	};
}
