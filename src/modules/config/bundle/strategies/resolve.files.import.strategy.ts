import { ConfigStrategy } from '../../config.strategy';
import type { SourceBundleConfig } from '../source.bundle.config';

export const resolveFilesImportStrategy = {
	key: 'resolveFilesImport',
	getDefault(): SourceBundleConfig['resolveFilesImport']
	{
		return {
			output: './dist',
			include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif'],
			exclude: [],
		};
	},
	prepare(value: any): SourceBundleConfig['resolveFilesImport']
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
} satisfies ConfigStrategy<SourceBundleConfig['resolveFilesImport']>
