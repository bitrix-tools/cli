import { Environment } from '../../environment/environment';
import { PathDetector } from '../path/path-detector';
import { PathParser } from '../path/path-parser';

export function createPackageName(sourceDir: string): string
{
	if (Environment.getType() === 'source')
	{
		if (PathDetector.isInstallJs(sourceDir))
		{
			const { fullExtensionTrace } = PathParser.parseInstallJs(sourceDir);

			return fullExtensionTrace.join('.');
		}

		if (PathDetector.isInstallComponents(sourceDir))
		{
			const { namespace, componentName } = PathParser.parseInstallComponents(sourceDir);

			return `${namespace}:${componentName}`;
		}

		if (PathDetector.isInstallTemplates(sourceDir))
		{
			const { templateName } = PathParser.parseInstallTemplates(sourceDir);

			return templateName;
		}

		if (PathDetector.isInstallTemplateComponents(sourceDir))
		{
			const { moduleName, templateName, namespace, componentName } = PathParser.parseInstallTemplateComponents(sourceDir);

			return `${moduleName} -> ${templateName} -> ${namespace}:${componentName}`;
		}

		if (PathDetector.isInstallActivities(sourceDir))
		{
			const { moduleName, activityName } = PathParser.parseInstallActivity(sourceDir);

			return `${moduleName}.${activityName}`;
		}

		if (PathDetector.isModuleDev(sourceDir))
		{
			const { fullTrace } = PathParser.parseModuleDev(sourceDir);

			return fullTrace.join('.');
		}
	}

	if (Environment.getType() === 'project')
	{
		if (PathDetector.isLocalJs(sourceDir))
		{
			const { fullExtensionTrace } = PathParser.parseLocalJs(sourceDir);

			return fullExtensionTrace.join('.');
		}
	}
}
