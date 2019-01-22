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
	.option('--component', 'Starts the new component wizard')
	.option('--module', 'Starts the new module wizard')
	.separator()

	.header('Technology usage')
	.command('flow', 'Initializes Flow tech for current directory')
	.command('typescript', '(soon) Initializes TypeScript tech for current directory')
	.subheader('Options')
	.option('-i, --init', 'Initialize technology for current directory')
	.option('-p, --path', 'Initialize technology for specified directory')
	.separator()

	.header('Adjusts')
	.command('adjust', 'Adds Mercurial events handlers for all repositories. ' +
		'\nThe command modifies file ~/.hgrc. Before modification, ' +
		'\na backup copy of the file with the name will be created .hgrc.backup')
	.subheader('Options')
	.option('--hg', 'Adjusts hg repositories')
	.separator()

	.header('Testing')
	.command('test', 'Runs file change watcher for current directory')
	.subheader('Options')
	.option('-w, --watch', 'Run file change watcher for current directory')
	.option('-m, --modules', 'Run command for specified modules')
	.option('-p, --path', 'Run command for path');

export default function help() {
	helper.print();
}