import path from 'path';
import {appRoot} from '../constants';

export default function info() {
	const location = {
		root: appRoot,
		mercurial: {
			preupdate: path.resolve(appRoot, 'src', 'mercurial', 'hooks', 'preupdate.sh'),
			update: path.resolve(appRoot, 'src', 'mercurial', 'hooks', 'update.sh'),
		},
	};

	return {
		location,
	};
}
