import { BasePackage } from '../base-package';
import { createPackageName } from '../../utils/package/create-package-name';

export class ExtensionPackage extends BasePackage
{
	getName(): string
	{
		return createPackageName(this.getPath());
	}

	getModuleName(): string
	{
		return this.getPath().split('/').shift();
	}
}
