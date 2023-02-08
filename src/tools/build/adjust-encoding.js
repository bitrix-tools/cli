import fs from 'fs';
import jscharder from 'jschardet';
import iconv from 'iconv-lite';

export function getEncoding(buffer)
{
	const result = jscharder.detect(buffer);

	if (!result || result.encoding === 'UTF-8')
	{
		return 'utf-8';
	}

	return 'windows-1251';
}

export default function adjustEncoding(config) {
	const input = fs.readFileSync(config.input);
	const inputFileEncoding = getEncoding(input);
	const output = fs.readFileSync(config.output.js);
	const outputFileEncoding = getEncoding(output);

	const sourceContent = iconv.decode(output, outputFileEncoding);
	const content = iconv.encode(sourceContent, inputFileEncoding);

	fs.writeFileSync(config.output.js, content);
}