import { program } from 'commander';

import { buildCommand } from './commands/build/build-command';
import { testCommand } from './commands/test/test-command';
import { create } from './commands/create/create';
import { statCommand } from './commands/stat/stat-command';
import { generateTsconfigCommand } from "./commands/generate-tsconfig/generate-tsconfig.command";
import { checkCwdPreAction } from './hooks/check-cwd-pre-action';
import { adjustCwdPreAction } from './hooks/adjust-cwd-pre-action';
import { flowToTsCommand } from './commands/flow-to-ts/flow-to-ts.command';

program
	.name('bitrix')
	.description('CLI tool for building and testing bitrix extensions.')
	.addCommand(buildCommand)
	.addCommand(statCommand)
	.addCommand(testCommand)
	.addCommand(create)
	.addCommand(generateTsconfigCommand)
	.addCommand(flowToTsCommand)
	.hook('preAction', adjustCwdPreAction)
	.hook('preAction', checkCwdPreAction)
	.parse(process.argv);
