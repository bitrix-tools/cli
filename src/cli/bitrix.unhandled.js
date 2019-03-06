import Logger from '@bitrix/logger';
import argv from '../process/argv';
import help from '../help';
import * as pkg from '../../package.json';

export default function bitrixUnhandledCommand(params = argv) {
	if (params.help) {
		help();
		return;
	}

	if (params.version) {
		Logger.log(pkg.name, pkg.version);
		return;
	}

	Logger.log('Unknown command. Try run "bitrix --help" for more information');
}