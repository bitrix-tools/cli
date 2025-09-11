import { PackageFactoryStrategy } from '../../package-factory';
import { TemplatePackage } from '../../package/template-package';
import { PathDetector } from '../../../../utils/path/path-detector';

export const templateStrategy: PackageFactoryStrategy = {
	match: ({ path }) => {
		return (
			PathDetector.isLocalTemplates(path)
			|| PathDetector.isLocalInstallTemplates(path)
		);
	},
	create: ({ path }) => new TemplatePackage({ path }),
};
