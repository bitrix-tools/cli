import type { TransformOptions } from '@babel/core';
import type { MinifyOptions } from 'terser';

export type CommandHook = {
	type: 'build' | 'test';
	title: string;
	extensions: string[];
};

export type ActionHook = {
	type: 'action';
	title: string;
	run: () => Promise<any> | void;
};

export interface BundleConfig {
	input: string;
	output: string | { js: string; css: string };
	namespace?: string;
	concat?: {
		js?: string[];
		css?: string[];
	};
	adjustConfigPhp?: boolean;
	treeshake?: boolean;
	'protected'?: boolean;
	plugins?: {
		babel?: boolean | TransformOptions;
		custom?: Array<string | ((...args: any[]) => any)>;
	};
	cssImages?: {
		type?: 'inline' | 'copy';
		output?: string;
		maxSize?: number;
		svgo?: boolean;
	};
	resolveFilesImport?: {
		output?: string;
		include?: string[];
		exclude?: string[];
	};
	browserslist?: boolean | string | string[];
	minification?: boolean | MinifyOptions;
	transformClasses?: boolean;
	sourceMaps?: boolean;
	tests?: {
		localization?: {
			languageId?: string;
			autoLoad?: boolean;
		};
	};
	hooks?: {
		beforeBuild?: (CommandHook | ActionHook)[];
		afterBuild?: (CommandHook | ActionHook)[];
		beforeTest?: (CommandHook | ActionHook)[];
		afterTest?: (CommandHook | ActionHook)[];
	};
}
