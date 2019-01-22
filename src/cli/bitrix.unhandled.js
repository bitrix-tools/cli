import argv from '../process/argv';
import help from '../help';

export default function bitrixUnhandledCommand(params = argv) {
	if (params.help) {
		return help();
	}

	if (params.version) {
		const pkg = require('../package.json');
		return console.log(pkg.name, pkg.version);
	}

	console.log('Unknown command. Try run "bitrix --help" for more information');
}