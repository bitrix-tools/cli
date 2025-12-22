import fg from 'fast-glob';
import * as path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { PackageFactory } from '../../modules/packages/package-factory';

type FindPackageOptions = {
	startDirectory: string,
	packageFactory: PackageFactory,
};

export function findPackages({ startDirectory, packageFactory }: FindPackageOptions): NodeJS.ReadableStream
{
	const patterns = [
		'**/bundle.config.js',
		'**/bundle.config.ts',
		'**/script.es6.js',
	];

	const fastGlobStream = fg.stream(
		patterns,
		{
			cwd: startDirectory,
			dot: true,
			onlyFiles: true,
			unique: true,
			absolute: true,
		},
	);

	let count = 0;

	const transformStream = new Transform({
		objectMode: true,
		transform(chunk: Buffer, encoding: BufferEncoding, callback: () => void) {
			count++;

			const extensionDir = path.dirname(
				chunk.toString(encoding),
			);

			const extension = packageFactory.create({
				path: extensionDir,
			});

			this.push({
				extension,
				count,
			});

			callback();
		},
		flush(callback: () => void) {
			this.emit('done', { count });
			callback();
		},
	});

	return Readable.from(fastGlobStream).pipe(transformStream);
}
