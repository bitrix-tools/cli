import Help from './tools/help';

const helper = new Help();

helper
	.usage('bitrix <command> [options]')

	.header('Build code')
	.command('bitrix build', '[options ...]','Builds all bundles from current directory')
	.subheader('Options')
	.option('-w, --watch', '[<fileExtension>[, ...]]', 'Run file watcher')
	.option('-m, --modules', '<moduleName>[, ...]', 'Build specified modules')
	.option('-p, --path', '<directoryPath>', 'Build by directory path')
	.option('-t, --test', '', 'Run tests after build')
	.option('-e, --extensions', '<extensionName>[, ...]', 'Build specified extension[s] only')
	.separator()

	.header('Testing')
	.command('bitrix test', '', 'Runs tests')
	.subheader('Options')
	.option('-w, --watch', '[<fileExtension>[, ...]]', 'Run file watcher')
	.option('-m, --modules', '<moduleName>[, ...]', 'Build specified modules')
	.option('-p, --path', '<directoryPath>', 'Build by directory path')
	.option('-e, --extensions', '<extensionName>[, ...]', 'Build specified extension[s] only')
	.separator()

	.header('Create extension')
	.command('bitrix create', '[<extensionName>]', 'Run create extension wizard')
	.subheader('Options')
	.option('-y', '', 'Create extension with default values')
	.separator()

	.header('Custom code generation')
	.command('bitrix run', '<templatePath>', 'Run custom template')
	.subheader('Options')
	.option('any', 'any', 'You can use any parameters that the template supports')
	.separator()

	.header('Settings')
	.command('bitrix settings', '', 'Runs settings wizard')
	.separator()

	.header('Info')
	.command('bitrix info', '', 'Print information about tools')
	.separator()

	.header('Help')
	.command('bitrix --help, -h', '', 'Print help information')
	.separator()
	.header('More information')
	.subheader('https://github.com/bitrix-tools/cli');

export default function help() {
	helper.print();
}