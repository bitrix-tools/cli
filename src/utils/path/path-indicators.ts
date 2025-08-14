import * as path from 'node:path';

export class PathIndicators
{
	static getInstallJs(): string
	{
		return path.join(path.sep, 'install', 'js', path.sep);
	}

	static getInstallComponents(): string
	{
		return path.join(path.sep, 'install', 'components', path.sep);
	}

	static getInstallTemplates(): string
	{
		return path.join(path.sep, 'install', 'templates', path.sep);
	}

	static getInstallTemplateComponents(): string
	{
		return path.join(path.sep, 'components', path.sep);
	}

	static getInstallActivities(): string
	{
		return path.join(path.sep, 'install', 'activities', path.sep);
	}

	static getModuleDev(): string
	{
		return path.join(path.sep, 'dev', path.sep);
	}

	static getLocalJs(): string
	{
		return path.join(path.sep, 'local', 'js', path.sep);
	}

	static getLocalComponents(): string
	{
		return path.join(path.sep, 'local', 'components', path.sep);
	}

	static getLocalTemplates(): string
	{
		return path.join(path.sep, 'local', 'templates', path.sep);
	}

	static getLocalActivities(): string
	{
		return path.join(path.sep, 'local', 'activities', path.sep);
	}

	static getLocalModules(): string
	{
		return path.join(path.sep, 'local', 'modules', path.sep);
	}
}
