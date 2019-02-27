import minimist from 'minimist';
import alias from '../param-alias';

export default minimist(
	process.argv.slice(2),
	{alias},
);