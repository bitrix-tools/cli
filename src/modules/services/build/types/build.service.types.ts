import type { RollupLog } from 'rollup';

export interface BundleFileInfo {
	fileName: string;
	size: number;
}

export interface BuildResult {
	warnings: RollupLog[];
	errors: RollupLog[];
	bundles: BundleFileInfo[];
	dependencies: string[];
}

export type BuildOptions = {
	input: string;
	output: { js: string, css: string };
	targets: string[];
	namespace: string;
	typescript?: boolean;
};

export type BuildCodeOptions = {
	code: string;
	targets: string[];
	namespace: string;
	typescript?: boolean;
};

export interface BuildCodeResult {
	warnings: RollupLog[];
	errors: RollupLog[];
	code: string;
	dependencies: string[];
}
