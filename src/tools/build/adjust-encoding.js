import * as fs from 'fs';
import jscharder from 'jschardet';
import * as iconv from 'iconv-lite';

export function getEncoding(buffer)
{
	const result = jscharder.detect(buffer);

	if (!result || result.encoding === 'UTF-8' || result.encoding === 'ascii')
	{
		return 'utf-8';
	}

	return 'windows-1251';
}

export default function adjustEncoding(config) {
	const input = fs.readFileSync(config.input);
	const inputFileEncoding = getEncoding(input);
	const output = fs.readFileSync(config.output);
	const outputFileEncoding = getEncoding(output);

	const sourceContent = iconv.decode(output, outputFileEncoding);
	const content = iconv.encode(sourceContent, inputFileEncoding);

	fs.writeFileSync(config.output, content);
}