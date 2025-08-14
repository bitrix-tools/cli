import { Command } from 'commander';
import { Environment } from '../environment/environment';

export function checkCwdPreAction(thisCommand: Command, actionCommand: Command)
{
	const cwd = actionCommand.getOptionValue('path');
	const envType = Environment.getType();
	const root = Environment.getRoot();

	if (envType === 'unknown')
	{
		console.log(`\n❌ Error: \nThe target directory is outside the project root: ${cwd}\n`);
		process.exit(1);
	}
	else if (envType === 'project' && !cwd.startsWith(root))
	{
		console.log(`\n❌ Error: \nThe target directory is outside the project root: ${cwd}\n`);
		process.exit(1);
	}
	else if (envType === 'source' && !cwd.startsWith(root))
	{
		console.log(`\n❌ Error: \nThe target directory is outside the project root: ${cwd}\n`);
		process.exit(1);
	}
}
