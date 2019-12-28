interface SourceBundleConfig {
	input: string,
	output: {js: string, css: string} | string,
	namespace?: string,
	treeshake?: boolean,
	adjustConfigPhp?: boolean,
	protected?: boolean,
	rel?: Array<string>,
	plugins?: Array<{[key: string]: any}>,
	concat?: {
		js?: Array<string>,
		css?: Array<string>,
	},
	cssImages?: any,
	resolveFilesImport?: any,
}

export default SourceBundleConfig;