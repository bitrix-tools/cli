import colors from 'colors';
import Logger from '@bitrix/logger';

function space(count) {
	return ' '.repeat(Math.max(count, 2));
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

	command(command, value, description) {
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

		this.data.push([
			`${space(this.offset + 2)}${command}`,
			value,
			preparedDescription,
		]);
		return this;
	}

	option(option, value = '', description = '') {
		this.data.push([
			`${space(this.offset + 3)}${option}`,
			value,
			description,
		]);
		return this;
	}

	separator() {
		this.data.push(`${space(this.offset)}${colors.gray('-'.repeat(80))}`);
		return this;
	}

	print() {
		const [col1Size, col2Size, col3Size] = this.data.reduce((acc, item) => {
			if (Array.isArray(item))
			{
				acc[0] = Math.max(acc[0], item[0].length);
				acc[1] = Math.max(acc[1], item[1].length);
				acc[2] = Math.max(acc[2], item[2].length);
			}

			return acc;
		}, [0, 0, 0]);

		['\n', ...this.data, '\n'].forEach((item) => {
			if (Array.isArray(item))
			{
				const col1Spaces = space(
					(Math.max(item[0].length, col1Size) - Math.min(item[0].length, col1Size)) + (this.offset - 2),
				);
				const col2Spaces = space(
					(Math.max(item[1].length, col2Size) - Math.min(item[1].length, col2Size)) + (this.offset - 2),
				);
				const col3Spaces = space(
					(Math.max(item[2].length, col3Size) - Math.min(item[2].length, col3Size)) + (this.offset - 2),
				);

				Logger.log(`${item[0]}${col1Spaces}${item[1]}${col2Spaces}${item[2]}${col3Spaces}`);
			}
			else
			{
				Logger.log(item);
			}
		});
	}
}