import colors from 'colors';
import Logger from '@bitrix/logger';

function space(count) {
	return ' '.repeat(count);
}

export default class Help {
	constructor() {
		this.data = [];
		this.offset = 5;
	}

	usage(text) {
		this.data.push(`${space(this.offset)}${'Usage:'.bold} ${text}\n`);
		return this;
	}

	header(text) {
		this.data.push(`${space(this.offset)}${text}`.bold);
		return this;
	}

	subheader(text) {
		this.data.push(`${space(this.offset + 2)}${text}`.bold);
		return this;
	}

	command(command, description) {
		let preparedDescription = description;

		if (preparedDescription.includes('\n')) {
			preparedDescription = description
				.split('\n')
				.reduce((acc, item, index) => {
					if (index) {
						return `${acc}\n${space(20 + this.offset + 2)}${item}`;
					}

					return `${acc}${item}`;
				}, '');
		}

		this.data.push(`${space(this.offset + 2)}${command}${space(20 - command.length)}${preparedDescription}`);
		return this;
	}

	option(option, description) {
		this.data.push(`${space(this.offset + 4)}${option}${space(18 - option.length)}${description}`);
		return this;
	}

	separator() {
		this.data.push(`${space(this.offset)}${colors.gray('-'.repeat(60))}`);
		return this;
	}

	print() {
		['\n', ...this.data, '\n'].forEach((item) => {
			// eslint-disable-next-line
			Logger.log(`${item}`);
		});
	}
}