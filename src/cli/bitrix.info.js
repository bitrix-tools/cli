import info from '../tools/info';
import box from '../tools/box';
import 'colors';

const pkg = require('../package.json');

export default function bitrixInfo() {
	const { location } = info();

	const result = box(`
		Info ${pkg.name}, v${pkg.version}
		
		${'Flow'.bold}
		Package: ${location.flow}
		
		${'ESLint'.bold}
		Package: ${location.eslint}
		Config: ${location.eslintrc}
		
		${'Mercurial'.bold}
		hooks.preupdate: ${location.mercurial.preupdate}
		hooks.update: ${location.mercurial.update}
		
		Update: npm update -g ${pkg.name}
		Remove: npm uninstall -g ${pkg.name}
	`);

	console.log(result);
}