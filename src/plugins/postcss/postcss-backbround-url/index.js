// @flow
import postcss from 'postcss';
import path from 'path';
import {declProcessor} from 'postcss-url/src/lib/decl-processor';
import getDestDir from '../../rollup/rollup-plugin-files/get-dest-dir';

const postcssBackgroundUrl = postcss.plugin(
	'postcss-background-url',
	(options, sourceTo, context) => {
		const preparedOptions = Array.isArray(options) ? options : [options];

		const multipleOptions = preparedOptions.map((entry) => {
			const {type: url = 'inline', output, ...restOptions} = entry || {};

			const assetsPath = getDestDir({
				destDir: output,
				output: sourceTo,
				context,
			});

			if (typeof output === 'string')
			{
				restOptions.assetsPath = path.resolve(context, assetsPath);
			}
			else
			{
				restOptions.assetsPath = path.resolve(context, assetsPath, 'images');
			}

			return {maxSize: 14, fallback: 'copy', ...restOptions, url};
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