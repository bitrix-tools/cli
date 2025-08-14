import { PackageFactoryStrategy } from '../../package-factory';
import { TemplatePackage } from '../../packages/template-package';
import { PathDetector } from '../../../utils/path/path-detector';

export const templateStrategy: PackageFactoryStrategy = {
	match: ({ path }) => {
		return PathDetector.isInstallTemplates(path);
	},
	create: ({ path }) => new TemplatePackage({ path }),
};
