import type ConcatConfig from './concat-config';

interface BundleConfig {
	input: string,
	output: {
		js: string,
		css: string,
	},
	name: string,
	treeshake: boolean,
	adjustConfigPhp: boolean,
	protected: boolean,
	rel: Array<string>,
	plugins: Array<{[key: string]: any}>,
	context: string,
	concat: ConcatConfig,
	cssImages: any,
	resolveFilesImport: any,
}

export default BundleConfig;