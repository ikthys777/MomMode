const CACHE_NAME = 'mom-mode-v23';
const ASSETS = ['index.html', 'manifest.json', 'icon-192.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.anthropic.com') || e.request.url.includes('api.x.ai') || e.request.url.includes('supabase.co') || e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com') || e.request.url.includes('unpkg.com')) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const rc = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, rc)); } return r; }).catch(() => caches.match(e.request)));
});
