import { program } from 'commander';

import { buildCommand } from './commands/build/build-command';
import { test } from './commands/test/test';
import { create } from './commands/create/create';
import { statCommand } from './commands/stat/stat-command';
import { checkCwdPreAction } from './hooks/check-cwd-pre-action';
import { adjustCwdPreAction } from './hooks/adjust-cwd-pre-action';

program
	.name('bitrix')
	.description('CLI tool for building and testing bitrix extensions.')
	.addCommand(buildCommand)
	.addCommand(statCommand)
	.addCommand(test)
	.addCommand(create)
	.hook('preAction', adjustCwdPreAction)
	.hook('preAction', checkCwdPreAction)
	.parse(process.argv);
