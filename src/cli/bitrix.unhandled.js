import argv from '../process/argv';
import help from '../help';

export default function bitrixUnhandledCommand(params = argv) {
	if (params.help) {
		help();
		return;
	}

	if (params.version) {
		// eslint-disable-next-line
		const pkg = require('../package.json');
		// eslint-disable-next-line
		console.log(pkg.name, pkg.version);
		return;
	}

	// eslint-disable-next-line
	console.log('Unknown command. Try run "bitrix --help" for more information');
}