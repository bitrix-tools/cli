import { PackageFactoryStrategy } from '../package-factory';
import { CustomPackage } from '../package/custom-package.js';

export const defaultStrategy: PackageFactoryStrategy = {
	match() {
		return true;
	},
	create({ path }) {
		console.trace(path);
		return new CustomPackage({ path });
	},
};
