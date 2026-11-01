// Keeps a copy of the game on the device so it opens without internet. Shows the saved copy at once and refreshes it in the background.
const CACHE = 'cretaceous-creatures-202611011608';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'sprites/icons.webp'];
const ART = ["sprites/allo.webp","sprites/ankylo.webp","sprites/bary.webp","sprites/brachio.webp","sprites/carno.webp","sprites/cerato.webp","sprites/compy.webp","sprites/dilo.webp","sprites/dimorph.webp","sprites/diplo.webp","sprites/elasmo.webp","sprites/galli.webp","sprites/giga.webp","sprites/ichthy.webp","sprites/iguan.webp","sprites/kentro.webp","sprites/mosa.webp","sprites/pachy.webp","sprites/para.webp","sprites/ptera.webp","sprites/quetz.webp","sprites/raptor.webp","sprites/spino.webp","sprites/stego.webp","sprites/styra.webp","sprites/theri.webp","sprites/trex.webp","sprites/trike.webp"];   // fetched in the background so every dinosaur works offline too
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))).then(() => { c.addAll(ART).catch(() => {}); })).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const pth = new URL(req.url).pathname, page = req.mode === 'navigate' || pth.endsWith('/') || pth.endsWith('/index.html');
  if (page) { e.respondWith(caches.open(CACHE).then(c => fetch(req, { cache: 'no-store' }).then(res => { if (res && res.ok) c.put('index.html', res.clone()).catch(() => {}); return res; }).catch(() => c.match('index.html')))); return; }
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()).catch(() => {}); return res; }).catch(() => null);
    return hit || (await fresh) || (req.mode === 'navigate' ? c.match('index.html') : Response.error());
  }));
});
