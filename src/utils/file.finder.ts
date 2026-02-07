import * as path from 'node:path';
import * as fs from 'node:fs';

type FindUpExistingDirectoryOptions = {
	fromDir: string;
	rootDir: string;
};

type FindUpFileOptions = {
	fileName: string;
	fromDir: string;
	rootDir?: string;
};

export class FileFinder
{
	private static findUpExistingDirectory(options: FindUpExistingDirectoryOptions): string | null
	{
		const { fromDir, rootDir } = options;
		const resolvedFromDir = path.resolve(fromDir);
		const resolvedRootDir = path.resolve(rootDir);

		if (fs.existsSync(resolvedFromDir) && fs.statSync(resolvedFromDir).isDirectory())
		{
			return resolvedFromDir;
		}

		const parentDir = path.dirname(resolvedFromDir);
		if (resolvedFromDir === parentDir || resolvedFromDir === resolvedRootDir)
		{
			return null;
		}

		return this.findUpExistingDirectory({
			fromDir: parentDir,
			rootDir: resolvedRootDir,
		});
	}

	static findUpFile(options: FindUpFileOptions): string | null
	{
		const { fileName, fromDir, rootDir = process.cwd() } = options;
		const existingFromDir = FileFinder.findUpExistingDirectory({
			fromDir,
			rootDir,
		});
		if (!existingFromDir)
		{
			return null;
		}

		const resolvedFromDir = path.resolve(existingFromDir);
		const resolvedRootDir = path.resolve(rootDir);

		const filePath = path.join(resolvedFromDir, fileName);
		if (fs.existsSync(filePath))
		{
			return filePath;
		}

		if (resolvedFromDir === resolvedRootDir)
		{
			return null;
		}

		const parentDir = path.dirname(resolvedFromDir);
		if (parentDir === resolvedFromDir)
		{
			return null;
		}

		return FileFinder.findUpFile({
			fileName,
			fromDir: parentDir,
			rootDir: resolvedRootDir,
		});
	}
}
