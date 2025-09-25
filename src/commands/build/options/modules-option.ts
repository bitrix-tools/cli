import { Option } from 'commander';
import { parseArgValue } from '../../../utils/cli/parse-arg-value';

const modulesOption = new Option(
	'-m, --modules [modules...]',
	'Specify Bitrix module names to build extensions from',
);

modulesOption.conflicts([
	'extensions',
	'path',
]);

modulesOption.argParser(
	parseArgValue,
);

export {
	modulesOption,
};
