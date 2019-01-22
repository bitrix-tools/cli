import createExtension from '../tools/create/extension';
import params from '../process/params';
import argv from '../process/argv';
import ask from '../tools/ask';
import box from '../tools/box';
import 'colors';

export default async function bitrixCreate() {
	if (argv.extension) {
		const answers = await ask([
			{
				name: 'Extension name',
				id: 'name',
				type: 'input',
				default: typeof argv.extension === 'string' ? argv.extension : '',
				validate: (input) => {
					if (typeof input === 'string' && input.length) {
						return true;
					} else {
						return 'Name should be not empty string';
					}
				}
			},
			{
				name: 'Enable tests',
				id: 'tests',
				type: 'confirm',
				default: true
			},
			{
				name: 'Enable Flow',
				id: 'flow',
				type: 'confirm',
				default: false
			}
		]);

		const extInfo = createExtension(params.path, answers);
		const info = box(`
			${'Success!'.bold}
			Extension ${extInfo.extName} created
			
			Run ${`bitrix build -p ./${answers.name}`.bold} for build extension
			
			${'Include extension in php'.bold}
			\\Bitrix\\Main\\Extension::load('${extInfo.extName}');
			
			${'Or import in your js code'.bold}
			import { ${extInfo.functionName} } from '${extInfo.extName}';
		`);
		return console.log(info);
	}

	if (argv.component) {
		const info = box(`Creating components is not yet available`);
		return console.log(info);
	}

	if (argv.module) {
		const info = box(`Creating modules is not yet available`);
		return console.log(info);
	}
}