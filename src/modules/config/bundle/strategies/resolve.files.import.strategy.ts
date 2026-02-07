import { ConfigStrategy } from '../../config.strategy';
import type { BundleConfig } from '../bundle.config';

export const resolveFilesImportStrategy = {
	key: 'resolveFilesImport',
	getDefault(): BundleConfig['resolveFilesImport']
	{
		return {
			output: './dist',
			include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif'],
			exclude: [],
		};
	},
	prepare(value: any): BundleConfig['resolveFilesImport']
	{
		if (value && typeof value === 'object')
		{
			return { ...this.getDefault(), ...value };
		}

		return this.getDefault();
	},
	validate(value: any): true | string
	{
		if (value && typeof value === 'object')
		{
			return true;
		}

		return 'Invalid \'resolveFilesImport\' value.';
	},
} satisfies ConfigStrategy<BundleConfig['resolveFilesImport']>
