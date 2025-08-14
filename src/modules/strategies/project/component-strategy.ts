import { PackageFactoryStrategy } from '../../package-factory';
import { PathDetector } from '../../../utils/path/path-detector';
import {ComponentPackage} from '../../packages/component-package';

export const componentStrategy: PackageFactoryStrategy = {
	match: ({ path }) => {
		return (
			PathDetector.isLocalComponents(path)
			|| PathDetector.isLocalInstallComponents(path)
		);
	},
	create: ({ path }) => new ComponentPackage({ path }),
};
