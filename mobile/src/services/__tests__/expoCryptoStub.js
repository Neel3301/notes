import { randomBytes as nodeRandom, randomUUID as nodeUUID } from 'node:crypto';
export const getRandomBytes = (n) => new Uint8Array(nodeRandom(n));
export const randomUUID = () => nodeUUID();
