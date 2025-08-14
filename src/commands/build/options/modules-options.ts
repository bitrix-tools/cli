import { Option } from 'commander';
import { parseArgValue } from '../../../utils/cli/parse-arg-value';

const modulesOptions = new Option(
	'-m, --modules [modules...]',
	'Specify Bitrix module names to build extensions from',
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
