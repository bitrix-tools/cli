export function code(strings: TemplateStringsArray, ...values: any[]): string
{
	let rawCode = '';
	for (let i = 0; i < strings.length; i++)
	{
		rawCode += strings[i];
		if (i < values.length)
		{
			rawCode += values[i];
		}
	}

	const lines = rawCode.split('\n');

	let minIndent = Infinity;
	for (let i = 0; i < lines.length; i++)
	{
		const line = lines[i];
		const trimmedLine = line.trim();

		if (trimmedLine === '')
		{
			continue;
		}

		const leadingWhitespaceMatch = line.match(/^\t*/);
		const leadingWhitespaceLength = leadingWhitespaceMatch ? leadingWhitespaceMatch[0].length : 0;

		if (leadingWhitespaceLength < minIndent)
		{
			minIndent = leadingWhitespaceLength;
		}
	}

	if (minIndent === Infinity)
	{
		minIndent = 0;
	}

	const indentedLines = lines.map((line) => {
		if (line.startsWith('\t'.repeat(minIndent)))
		{
			return line.substring(minIndent);
		}

		return line;
	});

	let processedCode = indentedLines.join('\n');

	processedCode = processedCode.trim();

	return processedCode;
}
