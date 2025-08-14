import { PackageFactoryStrategy } from '../../package-factory';
import { ExtensionPackage } from '../../packages/extension-package';
import { PathDetector } from '../../../utils/path/path-detector';

export const extensionStrategy: PackageFactoryStrategy = {
	match: ({ path }) => {
		return PathDetector.isInstallJs(path);
	},
	create: ({ path }) => new ExtensionPackage({ path }),
};
