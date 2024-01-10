import 'colors';
import Logger from '@bitrix/logger';
import info from '../tools/info';
import box from '../tools/box';
import * as pkg from '../../package.json';

export default function bitrixInfo() {
	const {location} = info();

	const result = box(`
		Info ${pkg.name}, v${pkg.version}
		
		${'Mercurial'.bold}
		hooks.preupdate: ${location.mercurial.preupdate}
		hooks.update: ${location.mercurial.update}
		
		Update: npm update -g ${pkg.name}
		Remove: npm uninstall -g ${pkg.name}
	`);

	// eslint-disable-next-line
	Logger.log(result);
}
