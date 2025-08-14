import PQueue from 'p-queue';

export const statQueue = new PQueue({
	concurrency: 1,
});
