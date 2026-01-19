export function createShutdown(action: () => any): () => Promise<any>
{
	let isShuttingDown = false;

	return async () => {
		if (isShuttingDown)
		{
			return;
		}

		isShuttingDown = true;

		await action();

		process.exit(0);
	};
}
