import PQueue from 'p-queue';

export const buildQueue = new PQueue({
	concurrency: 1,
});
