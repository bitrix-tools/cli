import { Option } from 'commander';
import { parseArgValue } from '../../../utils/cli/parse-arg-value';

const extensionsOption = new Option(
	'-e, --extensions [extensions,...]',
	'Show stats only for the specified extension(s)',
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
