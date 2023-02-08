import path from 'path';
import {appRoot} from '../constants';

export default function info() {
	const location = {
		root: appRoot,
		flow: path.resolve(appRoot, 'node_modules', 'flow-bin'),
		eslint: path.resolve(appRoot, 'node_modules', 'eslint'),
		eslintrc: path.resolve(appRoot, '.eslintrc.js'),
		mercurial: {
			preupdate: path.resolve(appRoot, 'src', 'mercurial', 'hooks', 'preupdate.sh'),
			update: path.resolve(appRoot, 'src', 'mercurial', 'hooks', 'update.sh'),
		},
	};

	return {
		location,
	};
}