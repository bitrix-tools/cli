import PQueue from 'p-queue';

export const testQueue = new PQueue({
	concurrency: 1,
});
