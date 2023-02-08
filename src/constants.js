import os from 'os';
import path from 'path';

export const appRoot = path.resolve(__dirname, '../');
export const lockFile = path.resolve(os.homedir(), '.bitrix.lock');