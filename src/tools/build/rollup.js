import {rollup} from 'rollup';
import getGlobals from '../../utils/get-globals';
import buildRollupConfig from '../../utils/build-rollup-config';

export default async function rollupBundle(config) {
	const {input, output} = buildRollupConfig(config);
	const bundle = await rollup(input);
	const globals = getGlobals(bundle.imports, config);
	await bundle.write({...output, globals});
	return bundle;
}