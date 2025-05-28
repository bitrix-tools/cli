import fs from 'fs';
import path from 'path';
import resolveExtension from './resolve-extension';

type ExtensionOptions = {
	name: string,
	lang: string,
	cwd: string,
};

type LoadMessageOptions = {
	extension?: ExtensionOptions | Array<ExtensionOptions>,
	langFile?: string | Array<string>,
};

function fetchMessages(filePath: string): {[key: string]: string}
{
	const result = {};

	if (fs.existsSync(filePath))
	{
		const contents = fs.readFileSync(filePath, 'ascii');

		const regex = /\$MESS\[['"](?<code>.+?)['"]]\s*=\s*['"](?<phrase>.*?)['"]/gm;
		let match;

		while ((match = regex.exec(contents)) !== null)
		{
			if (match.index === regex.lastIndex)
			{
				regex.lastIndex++;
			}

			result[match.groups.code] = match.groups.phrase;
		}
	}

	return result;
}

export default function loadMessages(options: LoadMessageOptions = {})
{
	if (Object.hasOwn(options, 'extension'))
	{
		const extensions = [options.extension].flat();
		extensions.forEach((extension) => {
			const resolverResult = resolveExtension(extension);
			if (resolverResult)
			{
				loadMessages({
					langFile: path.join(resolverResult.context, 'lang', extension.lang, 'config.php'),
				});
			}
		});
	}

	if (typeof options.langFile === 'string')
	{
		const messages = fetchMessages(options.langFile);
		const setMessage = (() => {
			if (global.window?.BX?.Loc?.setMessage)
			{
				return global.window?.BX?.Loc?.setMessage;
			}

			if (!global.window.BX)
			{
				global.window.BX = {};
			}

			if (!global.window.BX.message)
			{
				global.window.BX.message = (messages) => {
					if (typeof messages === 'object' && messages !== null)
					{
						Object.assign(global.window.BX.message, messages);
					}
				};
			}

			return global.window.BX.message;
		})();

		if (setMessage)
		{
			setMessage(messages);
		}
	}

	if (Array.isArray(options.langFile))
	{
		options.langFile.forEach((filePath) => {
			loadMessages({
				langFile: filePath,
			});
		});
	}
}
