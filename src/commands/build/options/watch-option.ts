import { Option } from 'commander';

export const watchOption = new Option(
	'-w, --watch',
	'Enable watch mode: automatically rebuild on file changes',
);
