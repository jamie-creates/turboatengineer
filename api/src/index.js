import { app } from '@azure/functions';
import { TableClient } from '@azure/data-tables';
import { gzipSync, gunzipSync } from 'node:zlib';
import {
  digest,
  token,
  passwordHash,
  verifyPassword,
  validCredentials,
} from './security.js';
import { parseSave } from '../shared/game.js';

let client;
const table = () =>
  (client ??= TableClient.fromConnectionString(
    process.env.TURBOAT_STORAGE,
    'Turboat',
  ));
const headers = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};
const response = (body, status = 200, extra = {}) => ({
  status,
  jsonBody: body,
  headers: { ...headers, ...extra },
});
const fail = (status, error) => {
  throw Object.assign(new Error(error), { httpStatus: status });
};
async function get(partitionKey, rowKey) {
  try {
    return await table().getEntity(partitionKey, rowKey);
  } catch (e) {
    if (e.statusCode === 404) return null;
    throw e;
  }
}
const cookie = (value, age = 2592000) =>
  `__Host-turboat=${value}; Path=/; Max-Age=${age}; HttpOnly; Secure; SameSite=Strict`;
function sessionToken(req) {
  return (req.headers.get('cookie') || '')
    .split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith('__Host-turboat='))
    ?.slice(15);
}
async function identity(req) {
  const raw = sessionToken(req);
  if (raw && /^[A-Za-z0-9_-]{43}$/.test(raw)) {
    const session = await get('sessions', digest(raw));
    if (session && session.expires > Date.now()) {
      const account = await get('accounts', session.account);
      if (account && account.authVersion === session.authVersion)
        return { id: 'local:' + account.rowKey, name: account.name };
    }
  }
  // Managed SWA supplies and validates this header; do not expose this function
  // directly through a separately hosted, unprotected Functions endpoint.
  try {
    const principal = JSON.parse(
      Buffer.from(
        req.headers.get('x-ms-client-principal') || '',
        'base64',
      ).toString(),
    );
    if (
      principal.identityProvider === 'aad' &&
      principal.userId &&
      principal.userRoles?.includes('authenticated')
    )
      return {
        id: 'aad:' + principal.userId,
        name: principal.userDetails || 'Microsoft player',
      };
  } catch {}
  return null;
}
async function limited(key, limit) {
  const rowKey = digest(key),
    now = Date.now();
  for (let n = 0; n < 4; n++) {
    const old = await get('limits', rowKey);
    const count = old && old.until > now ? old.count + 1 : 1;
    if (count > limit)
      fail(429, 'Too many attempts. Please wait 15 minutes and try again.');
    const entity = {
      partitionKey: 'limits',
      rowKey,
      count,
      until: old?.until > now ? old.until : now + 900000,
    };
    try {
      if (old)
        await table().updateEntity(entity, 'Replace', { etag: old.etag });
      else await table().createEntity(entity);
      return;
    } catch (e) {
      if (![409, 412].includes(e.statusCode)) throw e;
    }
  }
  fail(429, 'Please wait and try again.');
}
async function body(req) {
  if (req.headers.get('x-turboat-request') !== '1')
    fail(403, 'Request rejected.');
  const origin = req.headers.get('origin');
  const allowed = (
    process.env.TURBOAT_ORIGINS ||
    'https://anemkai.com,https://red-river-0895c9d1e.5.azurestaticapps.net'
  ).split(',');
  if (origin && !allowed.includes(origin))
    fail(403, 'Request origin rejected.');
  const text = await req.text();
  if (Buffer.byteLength(text) > 100000) fail(413, 'Save is too large.');
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      fail(400, 'Invalid request.');
    return parsed;
  } catch {
    fail(400, 'Invalid request.');
  }
}
async function accountHandler(req) {
  if (req.method === 'GET') {
    const user = await identity(req);
    return response({ name: user?.name || null });
  }
  const data = await body(req);
  if (data.action === 'logout') {
    const raw = sessionToken(req);
    if (raw)
      try {
        await table().deleteEntity('sessions', digest(raw));
      } catch (e) {
        if (e.statusCode !== 404) throw e;
      }
    return response({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
  }
  const username =
    typeof data.username === 'string' ? data.username.toLowerCase().trim() : '';
  if (!validCredentials(username, data.password))
    fail(400, 'Use a 3–24 character username and a 12–128 character password.');
  const ip = (req.headers.get('x-forwarded-for') || 'unknown')
    .split(',')[0]
    .trim();
  await limited('ip:' + ip, 60);
  await limited('user:' + username, 12);
  let account = await get('accounts', username),
    recovery;
  if (data.action === 'register') {
    if (account) fail(409, 'That username is unavailable.');
    recovery = token();
    account = {
      partitionKey: 'accounts',
      rowKey: username,
      name: username,
      ...(await passwordHash(data.password)),
      recoveryHash: digest(recovery),
      authVersion: token(),
    };
    try {
      await table().createEntity(account);
    } catch (e) {
      if (e.statusCode === 409) fail(409, 'That username is unavailable.');
      throw e;
    }
  } else if (data.action === 'recover') {
    if (
      !account ||
      typeof data.recovery !== 'string' ||
      digest(data.recovery.trim()) !== account.recoveryHash
    )
      fail(401, 'Username or recovery code is incorrect.');
    recovery = token();
    account = {
      ...account,
      ...(await passwordHash(data.password)),
      recoveryHash: digest(recovery),
      authVersion: token(),
    };
    await table().updateEntity(account, 'Replace', { etag: account.etag });
  } else if (data.action === 'login') {
    if (!(await verifyPassword(data.password, account)))
      fail(401, 'Username or password is incorrect.');
  } else fail(400, 'Unknown account action.');
  const raw = token();
  await table().createEntity({
    partitionKey: 'sessions',
    rowKey: digest(raw),
    account: username,
    authVersion: account.authVersion,
    expires: Date.now() + 2592000000,
  });
  return response({ name: username, recovery }, 200, {
    'Set-Cookie': cookie(raw),
  });
}
async function saveHandler(req) {
  const user = await identity(req);
  if (!user) fail(401, 'Sign in before using cloud saves.');
  const rowKey = digest(user.id);
  if (req.method === 'GET') {
    const entity = await get('saves', rowKey);
    return response(
      entity
        ? {
            save: JSON.parse(
              gunzipSync(Buffer.from(entity.data, 'base64')).toString(),
            ),
            etag: entity.etag,
            updated: entity.updated,
          }
        : { save: null, etag: null },
    );
  }
  await limited('save:' + rowKey, 100);
  const data = await body(req);
  let save;
  try {
    save = parseSave(JSON.stringify(data.save));
  } catch {
    fail(400, 'This is not a valid boatyard save.');
  }
  if (
    data.etag !== null &&
    (typeof data.etag !== 'string' || !/^W\/"[^"]+"$/.test(data.etag))
  )
    fail(400, 'Check the cloud save before uploading.');
  const compressed = gzipSync(JSON.stringify(save)).toString('base64');
  if (compressed.length > 30000) fail(413, 'Save is too large.');
  const entity = {
    partitionKey: 'saves',
    rowKey,
    data: compressed,
    updated: new Date().toISOString(),
  };
  try {
    if (data.etag === null) await table().createEntity(entity);
    else await table().updateEntity(entity, 'Replace', { etag: data.etag });
  } catch (e) {
    if ([409, 412, 404].includes(e.statusCode))
      fail(
        409,
        'The cloud save changed on another device. Check cloud save again before choosing which to keep.',
      );
    throw e;
  }
  const saved = await get('saves', rowKey);
  return response({ etag: saved.etag, updated: saved.updated });
}
const guarded = (handler) => async (req, context) => {
  try {
    return await handler(req);
  } catch (e) {
    if (!e.httpStatus) context.error('Cloud service failure', e.code || e.name);
    return response(
      {
        error: e.httpStatus
          ? e.message
          : 'Cloud service unavailable. Your device save is safe.',
      },
      e.httpStatus || 503,
    );
  }
};
app.http('account', {
  route: 'account',
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: guarded(accountHandler),
});
app.http('save', {
  route: 'save',
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  handler: guarded(saveHandler),
});
