import { Option } from 'commander';

export const forceOption = new Option(
	'-f, --force',
	'Force action, bypassing warnings and checks',
);
