import {
  randomBytes,
  scrypt as derive,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(derive);
export const digest = (text) => createHash('sha256').update(text).digest('hex');
export const token = () => randomBytes(32).toString('base64url');
export async function passwordHash(
  password,
  salt = randomBytes(16).toString('hex'),
) {
  const hash = await scrypt(password, salt, 64, {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });
  return { salt, passwordHash: hash.toString('hex') };
}
export async function verifyPassword(password, account) {
  const result = await passwordHash(
    password,
    account?.salt || '00000000000000000000000000000000',
  );
  return (
    !!account &&
    timingSafeEqual(
      Buffer.from(result.passwordHash, 'hex'),
      Buffer.from(account.passwordHash, 'hex'),
    )
  );
}
export function validCredentials(username, password) {
  return (
    typeof username === 'string' &&
    /^[a-z0-9_]{3,24}$/.test(username) &&
    typeof password === 'string' &&
    password.length >= 12 &&
    password.length <= 128
  );
}
