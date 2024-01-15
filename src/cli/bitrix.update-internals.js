const { exec } = require('child_process');

export default function bitrixUpdateInternals()
{
	exec('npx update-browserslist-db@latest', (err, stdout, stderr) => {
		if (err)
		{
			console.error(err);
		}
		else
		{
			console.log(stdout);
			console.error(stderr);
		}
	});
}
