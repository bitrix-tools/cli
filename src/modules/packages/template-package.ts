import { BasePackage } from '../base-package';

export class TemplatePackage extends BasePackage
{
	getName(): string
	{
		return this.getPath();
	}

	getModuleName(): string
	{
		return this.getPath().split('/').shift();
	}
}
