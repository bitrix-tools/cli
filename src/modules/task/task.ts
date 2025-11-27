import chalk from 'chalk';
import logUpdate from 'log-update';
import { TASK_STATUS_ICON } from './icons';

export interface TaskContext {
	update(message: string): void;
	log(message: string): void;
	succeed(message: string): void;
	fail(message: string): void;
	warn(message: string): void;
	readonly previousResult?: any;
}

export interface Task {
	title: string;
	run(ctx: TaskContext, result?: any): Promise<any>;
	subtasks?: Task[];
}

export class TaskRunner
{
	static async run(tasks: Task[], options: { indent?: number } = {}): Promise<any>
	{
		const indentLevel = options.indent ?? 0;
		return this.executeTasks(tasks, indentLevel, undefined);
	}

	private static async executeTasks(
		tasks: Task[],
		depth: number,
		initialResult?: any
	): Promise<any>
	{
		const indent = '  '.repeat(depth);
		let previousResult: any = initialResult;

		for (const task of tasks)
		{
			let isCompleted = false;

			const applyIndent = (text: string, prefix: string): string => {
				return text
					.split('\n')
					.map(line => prefix + line)
					.join('\n');
			};

			const ctx: TaskContext = {
				get previousResult() {
					return previousResult;
				},
				update: (message: string) => {
					if (!isCompleted)
					{
						const firstLine = message.split('\n')[0];
						logUpdate(applyIndent(firstLine, indent));
					}
				},
				log: (message: string) => {
					logUpdate.clear();
					console.log(applyIndent(message, indent));
				},
				succeed: (message: string) => {
					if (!isCompleted)
					{
						isCompleted = true;
						logUpdate.clear();
						const indented = message
							.split('\n')
							.map(line => `${indent}[${chalk.green(TASK_STATUS_ICON.success)}] ${line}`)
							.join('\n');
						console.log(indented);
					}
				},
				fail: (message: string) => {
					if (!isCompleted)
					{
						isCompleted = true;
						logUpdate.clear();
						const indented = message
							.split('\n')
							.map(line => `${indent}[${chalk.red(TASK_STATUS_ICON.fail)}] ${line}`)
							.join('\n');
						console.log(indented);
					}
				},
				warn: (message: string) => {
					if (!isCompleted)
					{
						isCompleted = true;
						logUpdate.clear();
						const indented = message
							.split('\n')
							.map(line => `${indent}[${chalk.yellow(TASK_STATUS_ICON.warning)}] ${line}`)
							.join('\n');
						console.log(indented);
					}
				},
			};

			if (depth > 0)
			{
				ctx.update(`[${chalk.green('•')}] ${task.title}`);
			}
			else
			{
				ctx.update(task.title);
			}

			try
			{
				const result = await task.run(ctx, previousResult);
				previousResult = result;
			}
			catch (error: any)
			{
				ctx.fail(error.message || 'Failed');
				throw error;
			}
			finally
			{
				if (!isCompleted)
				{
					logUpdate.clear();
					console.log(applyIndent(task.title, indent));
				}

				if (task.subtasks && task.subtasks.length > 0)
				{
					void await this.executeTasks(task.subtasks, depth + 1, previousResult);
				}
			}
		}

		return previousResult;
	}
}
