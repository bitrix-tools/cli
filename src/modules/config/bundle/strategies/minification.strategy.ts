import { ConfigStrategy } from '../../config.strategy';
import type { MinifyOptions } from 'terser';
import {type} from 'node:os';

export const minificationStrategy = {
	key: 'minification',
	getDefault(): boolean | MinifyOptions
	{
		return false;
	},
	prepare(value: any): boolean | MinifyOptions
	{
		if (value && typeof value === 'object')
		{
			return value;
		}

		return this.getDefault();
	},
	validate(value: any): true | string
	{
		return true;
	},
} satisfies ConfigStrategy<boolean | MinifyOptions>
