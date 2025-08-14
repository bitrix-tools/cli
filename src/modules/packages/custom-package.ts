import * as path from 'node:path';
import { BasePackage } from '../base-package';
import { Environment } from '../../environment/environment';

export class CustomPackage extends BasePackage
{
	getName(): string
	{
		return path.relative(Environment.getRoot(), this.getPath());
	}

	getModuleName(): string
	{
		return this.getPath().split('/').shift();
	}
}
