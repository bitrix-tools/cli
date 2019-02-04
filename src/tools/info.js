import * as path from 'path';
import { appRoot } from '../constants';

export default function info() {
	const location = {
		root: appRoot,
		flow: path.resolve(appRoot, 'node_modules', 'flow-bin'),
		eslint: path.resolve(appRoot, 'node_modules', 'eslint'),
		eslintrc: path.resolve(appRoot, '.eslintrc.js'),
	};

	return {
		location,
	};
}