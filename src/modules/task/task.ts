import chalk from 'chalk';
import ora from 'ora';

export interface TaskContext
{
	update(message: string): void;
	log(message: string): void;
	succeed(message: string): void;
	fail(message: string): void;
	warn(message: string): void;
	border(text: string, color?: string, indentBeforeBorder?: number): void;
	readonly previousResult?: any;
}

export interface Task
{
	title: string;
	run(ctx: TaskContext, result?: any): Promise<any>;
	subtasks?: Task[];
}

export class TaskRunner
{
	static async runTask(task: Task, title?: string): Promise<any>
	{
		const taskTitle = title || task.title;
		const spinner = ora({
			text: taskTitle,
			spinner: 'dots',
		});
		spinner.start();

		let isFinished = false;

		try
		{
			const result = await task.run({
				get previousResult() {
					return undefined;
				},
				update: (message: string) => {
					if (!isFinished)
					{
						spinner.text = message;
					}
				},
				log: (message: string) => {
					console.log(message);
				},
				succeed: (message: string) => {
					if (!isFinished)
					{
						isFinished = true;
						spinner.succeed(message || taskTitle);
					}
				},
				fail: (message: string) => {
					if (!isFinished)
					{
						isFinished = true;
						spinner.fail(message || 'Failed');
					}
				},
				warn: (message: string) => {
					if (!isFinished)
					{
						isFinished = true;
						spinner.warn(message);
					}
				},
				border: (text: string, color?: string, indentBeforeBorder: number = 0) => {
					const colorFn = color && typeof chalk[color as keyof typeof chalk] === 'function'
						? (chalk as any)[color]
						: (str: string) => str;

					const beforeBorderIndent = ' '.repeat(indentBeforeBorder);

					const lines = text.split('\n');
					const borderedLines = lines.map((line) => {
						return chalk.bold(colorFn(`${beforeBorderIndent}| `)) + line
					});
					console.log(borderedLines.join('\n'));
				},
			});

			if (!isFinished)
			{
				spinner.succeed(taskTitle);
			}

			return result;
		}
		catch (error: any)
		{
			if (!isFinished)
			{
				isFinished = true;
				spinner.fail(taskTitle);
			}
			console.log(chalk.red(`  Error: ${error.message || 'Unknown error'}`));
			if (error.stack)
			{
				console.log(chalk.red(`  Stack: ${error.stack}`));
			}
			throw error;
		}
	}

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
			const taskTitle = task.title;
			const spinner = ora({
				text: taskTitle,
				spinner: 'dots',
				prefixText: indent,
			});
			spinner.start();

			let isFinished = false;

			const context: TaskContext = {
				get previousResult() {
					return previousResult;
				},
				update: (message: string) => {
					if (!isFinished)
					{
						spinner.text = message;
					}
				},
				log: (message: string) => {
					const indentedMessage = message
						.split('\n')
						.map(line => `${indent}${line}`)
						.join('\n');
					console.log(indentedMessage);
				},
				succeed: (message: string) => {
					if (!isFinished)
					{
						isFinished = true;
						spinner.succeed(message || taskTitle);
					}
				},
				fail: (message: string) => {
					if (!isFinished)
					{
						isFinished = true;
						spinner.fail(message || taskTitle);
					}
				},
				warn: (message: string) => {
					if (!isFinished)
					{
						isFinished = true;
						spinner.warn(message);
					}
				},
				border: (text: string, color?: string, indentBeforeBorder: number = 0) => {
					const colorFn = color && typeof chalk[color as keyof typeof chalk] === 'function'
						? (chalk as any)[color]
						: (str: string) => str;

					const beforeBorderIndent = ' '.repeat(indentBeforeBorder);

					const lines = text.split('\n');
					const borderedLines = lines.map((line) => {
						return colorFn(`${beforeBorderIndent}| `) + line;
					});
					const indentedBorderedLines = borderedLines.map(line => `${indent}${line}`);
					console.log(indentedBorderedLines.join('\n'));
				},
			};

			try
			{
				const result = await task.run(context, previousResult);
				previousResult = result;

				if (!isFinished)
				{
					spinner.succeed(taskTitle);
				}
			}
			catch (error: any)
			{
				if (!isFinished)
				{
					isFinished = true;
					spinner.fail(taskTitle);
				}

				const errorMessage = error.message || 'Unknown error';
				const indentedMessage = errorMessage
					.split('\n')
					.map((line: string) => {
						return `${indent}  ${chalk.red(`Error: ${line}`)}`;
					})
					.join('\n');
				console.log(indentedMessage);
				if (error.stack)
				{
					const stackMessage = error.stack
						.split('\n')
						.map((line: string) => {
							return `${indent}  ${chalk.red(`Stack: ${line}`)}`;
						})
						.join('\n');
					console.log(stackMessage);
				}
				throw error;
			}

			if (task.subtasks && task.subtasks.length > 0)
			{
				previousResult = await this.executeTasks(task.subtasks, depth + 1, previousResult);
			}
		}

		return previousResult;
	}
}
