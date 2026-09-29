const CACHE='daycraft-v2.0.0';
const CORE=['./','./index.html','./css/app.css','./js/app.js','./js/icons.js','./manifest.webmanifest','./assets/favicon.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{const copy=res.clone(); if(new URL(e.request.url).origin===location.origin) caches.open(CACHE).then(c=>c.put(e.request,copy)); return res;}).catch(()=>caches.match('./index.html'))));
});
