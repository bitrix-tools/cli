import { type } from 'main.core';

export function {{name}}(data)
{
	if (!type.isNil(data))
	{
		console.log(data);
	}
}

{{name}}('{{name}} is works!');