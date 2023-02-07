import {Type} from 'main.core';

export class Testext
{
	constructor(options = {name: 'Testext'})
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