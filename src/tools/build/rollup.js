// @flow

import {rollup} from 'rollup';
import getGlobals from '../../utils/get-globals';
import buildRollupConfig from '../../utils/build-rollup-config';
import type BundleConfig from '../../@types/config';

export default async function rollupBundle(config: BundleConfig) {
	const {input, output} = buildRollupConfig(config);
	const bundle = await rollup(input);
	const {output: generateOutput} = await bundle.generate({...output});
	const imports = generateOutput.reduce((acc, item) => {
		return [...acc, ...item.imports];
	}, []);
	const globals = getGlobals(imports, config);
	await bundle.write({...output, globals});
	return {imports, bundle};
}