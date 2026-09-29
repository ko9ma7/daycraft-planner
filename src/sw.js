const CACHE='daycraft-v2.6.0';
const CORE=['./','./index.html','./css/app.css?v=2.6.0','./js/app.js?v=2.6.0','./js/icons.js?v=2.6.0','./manifest.webmanifest?v=2.6.0','./assets/favicon.svg','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('daycraft-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith((async()=>{
    try {
      const fresh=await fetch(req,{cache:'no-cache'});
      if(fresh && fresh.ok){
        const cache=await caches.open(CACHE);
        cache.put(req,fresh.clone());
      }
      return fresh;
    } catch(err) {
      const hit=await caches.match(req,{ignoreSearch:false});
      if(hit) return hit;
      if(req.mode==='navigate') return (await caches.match('./index.html')) || Response.error();
      throw err;
    }
  })());
});
