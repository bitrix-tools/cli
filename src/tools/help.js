import colors from 'colors';

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
		if (description.includes('\n')) {
			description = description.split('\n').reduce((acc, item, index) => {
				if (index) {
					acc += `\n${space(20 + this.offset + 2)}${item}`;
				} else {
					acc += item;
				}

				return acc;
			}, '');
		}

		this.data.push(`${space(this.offset + 2)}${command}${space(20 - command.length)}${description}`);
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
		['\n', ...this.data, '\n'].forEach(item => {
			console.log(`${item}`);
		});
	}
}

function space(count) {
	return ' '.repeat(count);
}

function dot(count) {
	return '.'.repeat(count).gray;
}