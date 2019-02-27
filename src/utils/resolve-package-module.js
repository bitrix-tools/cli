import path from 'path';
import {appRoot} from '../constants';

export default function resolvePackageModule(moduleName) {
	return path.resolve(appRoot, 'node_modules', moduleName);
}