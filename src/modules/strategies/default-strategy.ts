import { PackageFactoryStrategy } from '../package-factory';
import { CustomPackage } from '../packages/custom-package.js';

export const defaultStrategy: PackageFactoryStrategy = {
	match() {
		return true;
	},
	create({ path }) {
		return new CustomPackage({ path });
	},
};
