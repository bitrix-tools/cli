import { Command } from 'commander';
import { parseArgValue } from '../../utils/cli/parse-arg-value';
import { preparePath } from '../../utils/cli/prepare-path';

export const test = new Command('test');

test
	.description('Run extension tests')
	.option('-w, --watch', 'Watch mode. Run tests by source changes')
	.option('-e, --extensions <extensions...>', 'Run test from specified extension', parseArgValue)
	.option('-m, --modules <modules...>', 'Run test from specified modules', parseArgValue)
	.option('-p, --path [path]', 'Run test from path', preparePath, process.cwd())
	.action((options): void => {
		console.log(options);
	});


