// @flow

import path from 'path';
import invalidateModuleCache from './invalidate-module-cache';
import {appRoot} from '../constants';
import type BundleConfig from '../@types/config';

export default function buildRollupConfig(config: BundleConfig) {
	invalidateModuleCache(path.resolve(appRoot, 'dist/rollup.config.js'));
	// eslint-disable-next-line
	const rollupConfig = require(path.resolve(appRoot, 'dist/rollup.config.js'));

	return rollupConfig({
		input: {
			input: path.resolve(config.context, config.input),
			treeshake: config.treeshake !== false,
		},
		output: {
			js: path.resolve(config.context, config.output.js),
			css: path.resolve(config.context, config.output.css),
			name: config.name,
		},
		plugins: config.plugins,
		cssImages: config.cssImages,
		resolveFilesImport: config.resolveFilesImport,
		context: config.context,
		targets: config.targets,
		transformClasses: config.transformClasses,
		minification: config.minification,
		sourceMaps: config.sourceMaps,
	});
}