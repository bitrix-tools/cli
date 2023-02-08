import fs from 'fs';
import mustache from 'mustache';
import fse from 'fs-extra';

export default function render({input, output, data = {}}) {
	if (fs.existsSync(input)) {
		if (fs.existsSync(output)) {
			fs.unlinkSync(output);
		}

		const template = fs.readFileSync(input, 'utf-8');

		fse.outputFileSync(output, mustache.render(template, data));
	}
}