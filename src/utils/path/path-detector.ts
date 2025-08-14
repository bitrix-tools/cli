import * as path from 'node:path';
import { Environment } from '../../environment/environment';
import {PathIndicators} from './path-indicators';

export class PathDetector
{
	static #getModuleName(sourcePath: string): string
	{
		return path.relative(Environment.getRoot(), sourcePath).split(path.sep).shift();
	}

	static isInstallJs(sourcePath: string): boolean
	{
		const moduleName = this.#getModuleName(sourcePath);
		const installJsIndicator = path.join(moduleName, PathIndicators.getInstallJs(), moduleName);

		return sourcePath.includes(installJsIndicator);
	}

	static isInstallComponents(sourcePath: string): boolean
	{
		const moduleName = this.#getModuleName(sourcePath);
		const installJsIndicator = path.join(moduleName, PathIndicators.getInstallComponents());

		return sourcePath.includes(installJsIndicator);
	}

	static isInstallTemplates(sourcePath: string): boolean
	{
		if (PathDetector.isInstallTemplateComponents(sourcePath))
		{
			return false;
		}

		const moduleName = this.#getModuleName(sourcePath);
		const installJsIndicator = path.join(moduleName, PathIndicators.getInstallTemplates());

		return sourcePath.includes(installJsIndicator);
	}

	static isInstallTemplateComponents(sourcePath: string): boolean
	{
		const moduleName = this.#getModuleName(sourcePath);
		const installTemplatesIndicator = path.join(moduleName, PathIndicators.getInstallTemplates());
		const templatePath = sourcePath.split(installTemplatesIndicator)[1];

		if (templatePath)
		{
			return templatePath.includes(PathIndicators.getInstallTemplateComponents());
		}

		return false;
	}

	static isInstallActivities(sourcePath: string): boolean
	{
		const moduleName = this.#getModuleName(sourcePath);
		const installJsIndicator = path.join(moduleName, PathIndicators.getInstallActivities());

		return sourcePath.includes(installJsIndicator);
	}

	static isModuleDev(sourcePath: string): boolean
	{
		const moduleName = this.#getModuleName(sourcePath);
		const devIndicator = path.join(moduleName, PathIndicators.getModuleDev());

		return sourcePath.includes(devIndicator);
	}

	static isLocalJs(sourcePath: string): boolean
	{
		return sourcePath.includes(PathIndicators.getLocalJs());
	}

	static isLocalComponents(sourcePath: string): boolean
	{
		return sourcePath.includes(PathIndicators.getLocalComponents());
	}

	static isLocalTemplates(sourcePath: string): boolean
	{
		return sourcePath.includes(PathIndicators.getLocalTemplates());
	}

	static isLocalActivities(sourcePath: string): boolean
	{
		return sourcePath.includes(PathIndicators.getLocalActivities());
	}

	static isLocalInstallJs(sourcePath: string): boolean
	{
		return (
			sourcePath.includes(PathIndicators.getLocalModules())
			&& sourcePath.includes(PathIndicators.getInstallJs())
		);
	}

	static isLocalInstallComponents(sourcePath: string): boolean
	{
		return (
			sourcePath.includes(PathIndicators.getLocalModules())
			&& sourcePath.includes(PathIndicators.getInstallComponents())
		);
	}

	static isLocalInstallTemplates(sourcePath: string): boolean
	{
		return (
			sourcePath.includes(PathIndicators.getLocalModules())
			&& sourcePath.includes(PathIndicators.getInstallTemplates())
		);
	}
}
