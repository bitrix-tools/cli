import { Option } from 'commander';
import { parseArgValue } from '../../../utils/cli/parse-arg-value';

const extensionsOption = new Option(
	'-e, --extensions [extensions,...]',
	'Specify exact extension names to build',
);

extensionsOption.conflicts([
	'modules',
	'path',
]);

extensionsOption.argParser(
	parseArgValue,
);

export {
	extensionsOption,
};
