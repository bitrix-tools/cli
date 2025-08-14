import * as path from 'node:path';
import { PathIndicators } from './path-indicators';
import { Environment } from '../../environment/environment';

export class PathParser
{
	static #getModuleName(sourceDir: string): string
	{
		return path.relative(Environment.getRoot(), sourceDir).split(path.sep).shift();
	}

	static parseInstallJs(sourceDir: string): {
		moduleName: string,
		extensionTrace: Array<string>,
		fullExtensionTrace: Array<string>,
	}
	{
		const [, extensionDir] = sourceDir.split(PathIndicators.getInstallJs());
		const [moduleName, ...extensionTrace] = extensionDir.split(path.sep);
		const fullExtensionTrace = [moduleName, ...extensionTrace];

		return {
			moduleName,
			extensionTrace,
			fullExtensionTrace,
		};
	}

	static parseInstallComponents(sourceDir: string): {
		moduleName: string,
		namespace: string,
		componentName: string,
	}
	{
		const moduleName = this.#getModuleName(sourceDir);
		const [, namespaceDir] = sourceDir.split(PathIndicators.getInstallComponents());
		const [namespace, componentName] = namespaceDir.split(path.sep);

		return {
			moduleName,
			namespace,
			componentName,
		};
	}

	static parseInstallTemplates(sourceDir: string): {
		moduleName: string,
		templateName: string,
		restTrace: Array<string>,
		restPath: string,
	}
	{
		const moduleName = this.#getModuleName(sourceDir);
		const [, templateDir ] = sourceDir.split(PathIndicators.getInstallTemplates());
		const [templateName, ...restTrace] = templateDir.split(path.sep);
		const restPath = path.join(path.sep, ...restTrace);

		return {
			moduleName,
			templateName,
			restTrace,
			restPath,
		};
	}

	static parseInstallTemplateComponents(sourceDir: string): {
		moduleName: string,
		templateName: string,
		namespace: string,
		componentName: string,
	}
	{
		const moduleName = this.#getModuleName(sourceDir);
		const { templateName, restPath } = PathParser.parseInstallTemplates(sourceDir);
		const [, namespacePath] = restPath.split(PathIndicators.getInstallTemplateComponents());
		const segments = namespacePath.split(path.sep);
		const namespace = segments.shift();
		const componentName = segments.join(path.sep);

		return {
			moduleName,
			templateName,
			namespace,
			componentName,
		};
	}

	static parseInstallActivity(sourceDir: string): {
		namespace: string,
		moduleName: string,
		activityName: string,
	}
	{
		const moduleName = this.#getModuleName(sourceDir);
		const [, activityPath] = sourceDir.split(PathIndicators.getInstallActivities());
		const [namespace, activityName] = activityPath.split(path.sep);

		return {
			moduleName,
			namespace,
			activityName,
		};
	}

	static parseModuleDev(sourceDir: string): {
		moduleName: string,
		fullTrace: Array<string>,
	}
	{
		const moduleName = this.#getModuleName(sourceDir);
		const fullTrace = path.relative(Environment.getRoot(), sourceDir).split(path.sep);

		return {
			moduleName,
			fullTrace,
		};
	}

	static parseLocalJs(sourceDir: string): {
		moduleName: string,
		extensionTrace: Array<string>,
		fullExtensionTrace: Array<string>,
	}
	{
		const [, extensionDir] = sourceDir.split(PathIndicators.getLocalJs());
		const [moduleName, ...extensionTrace] = extensionDir.split(path.sep);
		const fullExtensionTrace = [moduleName, ...extensionTrace];

		return {
			moduleName,
			extensionTrace,
			fullExtensionTrace,
		};
	}
}
