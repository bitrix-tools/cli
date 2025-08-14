import { Command } from 'commander';
import * as path from 'node:path';
import { Environment } from '../environment/environment';

export function adjustCwdPreAction(thisCommand: Command, actionCommand: Command)
{
	const sourceCwd = actionCommand.getOptionValue('path');
	const envType = Environment.getType();
	const root = Environment.getRoot();

	console.log(envType, root);
	if (envType === 'project' && sourceCwd === root)
	{
		const newCwd = path.join(sourceCwd, 'local');
		actionCommand.setOptionValueWithSource('path', newCwd, sourceCwd);
	}
}
