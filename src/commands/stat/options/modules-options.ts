import { Option } from 'commander';
import { parseArgValue } from '../../../utils/cli/parse-arg-value';

const modulesOptions = new Option(
	'-m, --modules [modules...]',
	'Treat the provided arguments as module names — show all extensions related to those modules.',
);

modulesOptions.conflicts([
	'extensions',
	'path',
]);

modulesOptions.argParser(
	parseArgValue,
);

export {
	modulesOptions,
};
