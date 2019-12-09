import postcss from 'postcss';
import * as path from 'path';
import {declProcessor} from 'postcss-url/src/lib/decl-processor';

const postcssBackgroundUrl = postcss.plugin(
	'postcss-background-url',
	(options, sourceTo, context) => {
		const preparedOptions = (() => {
			if (Array.isArray(options))
			{
				return options;
			}

			return [options];
		})();

		const multipleOptions = preparedOptions.map((entry) => {
			const {type: url = 'rebase', output, ...restOptions} = entry || {};

			if (url === 'copy')
			{
				if (typeof output === 'string')
				{
					restOptions.assetsPath = path.resolve(context, output);
				}
				else
				{
					restOptions.assetsPath = path.resolve(path.dirname(sourceTo), 'images');
				}
			}

			return {...restOptions, url};
		});

		return (styles, result) => {
			const {from: sourceFrom} = result.opts || {};
			const from = sourceFrom ? path.dirname(sourceFrom) : '.';
			const to = sourceTo ? path.dirname(sourceTo) : from;

			styles.walkDecls((decl) => declProcessor(from, to, multipleOptions, result, decl));
		};
	},
);

export default postcssBackgroundUrl;