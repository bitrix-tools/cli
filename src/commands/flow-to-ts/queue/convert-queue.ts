import PQueue from 'p-queue';

export const convertQueue = new PQueue({
	concurrency: 1,
});
