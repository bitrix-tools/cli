import { Command } from 'commander';

export const create = new Command('create');

create
	.description('Build bitrix js-extensions')
	.argument('<name>', 'Extension name')
	.action((extensionName: string): void => {
		console.log(extensionName);
	});


