import os from 'os';
import { resolve } from 'path';

export const appRoot = resolve(__dirname, '../');
export const lockFile = resolve(os.homedir(), '.bitrix.lock');