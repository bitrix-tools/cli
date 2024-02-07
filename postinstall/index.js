try
{
	const fs = require('fs');
	const path = require('path');

	const autoprefixerFixedFilePath = path.join(__dirname, 'files-to-replace', 'autoprefixer', 'lib', 'supports.js');
	const autoprefixerOldFilePath = path.resolve(__dirname, '../', 'node_modules', 'autoprefixer', 'lib', 'supports.js');

	if (
		fs.existsSync(autoprefixerFixedFilePath)
		&& fs.existsSync(autoprefixerOldFilePath)
	)
	{
		fs.cpSync(autoprefixerFixedFilePath, autoprefixerOldFilePath);
		console.log('Autoprefixer fixed');
		console.log('Applied changes from https://github.com/postcss/autoprefixer/pull/1398/commits/8836204f8de19dfae8a1e6831db39ec3fcfde56c');
	}
}
catch (error)
{
	console.error(error);
}
