import * as fs from 'fs';
import detectCharacterEncoding from 'detect-character-encoding';

export function getEncoding(buffer)
{
	const result = detectCharacterEncoding(buffer);

	if (!result || result.encoding === 'UTF-8')
	{
		return 'utf-8';
	}

	return 'ascii';
}

export default function adjustEncoding(config) {
	const input = fs.readFileSync(config.input);
	const inputFileEncoding = getEncoding(input);
	const output = fs.readFileSync(config.output);

	fs.writeFileSync(config.output, output.toString(inputFileEncoding));
}