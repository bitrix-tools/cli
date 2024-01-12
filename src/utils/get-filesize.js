import fs from 'fs';
import filesize from 'filesize';

export default function getFileSize(filePath: string): string
{
	if (fs.existsSync(filePath))
	{
		const stat = fs.statSync(filePath);
		return filesize(stat.size, {round: 0})
	}

	return filesize(0, {round: 0});
}
