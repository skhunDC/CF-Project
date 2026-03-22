import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 16);

export const createId = (prefix: string) => `${prefix}_${nanoid()}`;
