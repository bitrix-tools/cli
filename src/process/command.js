import argv from './argv';

export default (
	(argv.version ? 'version' : '')
	|| (argv.help ? 'help' : '')
	|| (argv._[0])
	|| 'help'
);