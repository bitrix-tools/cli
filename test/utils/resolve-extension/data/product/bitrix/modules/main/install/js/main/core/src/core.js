import {Type} from 'main.core';

export class Core
{
	constructor(options = {name: 'Core'})
	{
		this.name = options.name;
	}

	setName(name)
	{
		if (Type.isString(name))
		{
			this.name = name;
		}
	}

	getName()
	{
		return this.name;
	}
}