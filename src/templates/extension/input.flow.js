// @flow

import {Tag} from 'main.core';

type {{name}}Options = {
	name: string;
};

export class {{name}}
{
	name: string;

	constructor(options: {{name}}Options = {name: '{{name}}'})
	{
		this.name = options.name;
	}

	setName(name: string)
	{
		this.name = name;
	}

	getName()
	{
		return this.name;
	}

	render(): HTMLElement
	{
		return Tag.render`
			<div class="ui-{{nameLower}}">
				<span class="ui-{{nameLower}}-name">${this.getName()}</span>
			</div>
		`;
	}
}