import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir = new URL('../dist/client/', import.meta.url);
await stat(new URL('index.html', dir));
async function walk(base, prefix = '') {
  const paths = [];
  for (const e of await readdir(base, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = prefix + e.name;
    if (e.isDirectory())
      paths.push(...(await walk(new URL(e.name + '/', base), p + '/')));
    else if (
      !['.map', '.gz', '.br'].some((ext) => e.name.endsWith(ext)) &&
      e.name !== 'sw.js' &&
      !e.name.startsWith('vinext-')
    )
      paths.push('/' + p);
  }
  return paths;
}
const assets = await walk(dir),
  hash = createHash('sha256');
for (const path of assets)
  hash.update(await readFile(new URL(path.slice(1), dir)));
const version = hash.digest('hex').slice(0, 12);
const code =
  "const CACHE='turboat-" +
  version +
  "';const ASSETS=" +
  JSON.stringify(assets) +
  ";self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('turboat-')&&k!==CACHE).map(k=>caches.delete(k)))))});self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/')||url.pathname.startsWith('/.auth/'))return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return;}if(ASSETS.includes(url.pathname))event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));});";
await writeFile(new URL('sw.js', dir), code);
console.log('Prepared offline cache:', assets.length, 'files');
