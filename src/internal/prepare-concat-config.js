// @flow

import path from "path";
import type ConcatConfig from '../@types/concat-config';

export default function prepareConcatConfig(files: ConcatConfig, context: string): ConcatConfig {
	if (typeof files !== 'object') {
		return {};
	}

	const result = {};

	Object.keys(files).forEach((key) => {
		if (Array.isArray(files[key])) {
			result[key] = files[key].map((filePath) => (
				path.resolve(context, filePath)
			));
		}
	});

	return result;
}