import slash from 'slash';

export default function isLocalPath(filePath: string): boolean {
	const localExp = new RegExp('/local/js/(.[a-z0-9-_]+)/(.[a-z0-9-_]+)/');
	const localRes = `${slash(filePath)}`.match(localExp);

	return !!localRes && !!localRes[1] && !!localRes[2];
}