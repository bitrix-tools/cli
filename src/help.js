import Help from './tools/help';

const helper = new Help();

helper
	.usage('bitrix <command> [options]')

	.header('Bundler commands')
	.command('build', 'Builds all bundles from current directory')
	.subheader('Options')
	.option('-w, --watch', 'Run file change watcher for current directory')
	.option('-m, --modules', 'Run command for specified modules')
	.option('-p, --path', 'Run command for path')
	.option('-t, --test', 'Run tests after build')
	.separator()

	.header('Create entities')
	.command('create <options>', 'Create entity')
	.subheader('Options')
	.option('--extension', 'Starts the new extension wizard')
	.separator()

	.header('Testing')
	.command('test', 'Runs file change watcher for current directory')
	.subheader('Options')
	.option('-w, --watch', 'Run file change watcher for current directory')
	.option('-m, --modules', 'Run command for specified modules')
	.option('-p, --path', 'Run command for path')

	.header('Settings')
	.command('settings', 'Runs settings wizard')
	.separator()

	.header('Info')
	.command('info', 'Prints information about tools')
	.separator()

	.header('Help')
	.command('--help, -h', 'Prints help information')
	.separator();

export default function help() {
	helper.print();
}