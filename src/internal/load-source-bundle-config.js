// @flow

import path from 'path';
import isEs6File from '../utils/is-es6-file';
import type SourceBundleConfig from '../@types/source-bundle-config';

export default function loadSourceBundleConfig(configPath: string): SourceBundleConfig {
	if (isEs6File(configPath)) {
		const context = configPath.replace('script.es6.js', '');

		return {
			input: path.resolve(context, 'script.es6.js'),
			output: {
				js: path.resolve(context, 'script.js'),
				css: path.resolve(context, 'style.css'),
			},
		};
	}

	// eslint-disable-next-line
	return require(configPath);
}