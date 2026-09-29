import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=new URL('../',import.meta.url).pathname;
const [html,app,sw,pkg]=await Promise.all([
  readFile(join(root,'src/index.html'),'utf8'),
  readFile(join(root,'src/js/app.js'),'utf8'),
  readFile(join(root,'src/sw.js'),'utf8'),
  readFile(join(root,'package.json'),'utf8').then(JSON.parse)
]);
const fail=(msg)=>{ console.error(`[qa-ui] ${msg}`); process.exitCode=1; };
const pass=(msg)=>console.log(`[qa-ui] OK: ${msg}`);

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
if(dup.length) fail(`duplicate ids: ${dup.join(', ')}`); else pass('no duplicate DOM ids');

const panelTargets=[...html.matchAll(/class="panel-tab[^"]*"[^>]*data-panel="([^"]+)"/g)].map(m=>m[1]);
if(panelTargets.length!==4) fail(`expected 4 panel tabs, found ${panelTargets.length}`);
for(const id of panelTargets) if(!ids.includes(id)) fail(`panel target missing: ${id}`);
if(panelTargets.every(id=>ids.includes(id))) pass('all panel tabs point to real panels');

if(!/let\s+activePanelId\s*=\s*['"]schedulePanel['"]/.test(app)) fail('activePanelId is not explicitly initialized');
else pass('active panel state is explicitly initialized');
if(!/VALID_PANEL_IDS/.test(app) || !/activePanelId='schedulePanel'/.test(app)) fail('active panel fallback guard missing');
else pass('active panel has a safe fallback');
if(!/syncActivePanel\(\{restoreScroll:true\}\)/.test(app)) fail('render path does not restore active panel');
else pass('full renders restore current panel and scroll position');

const refsBlock=app.match(/const ids = \[([\s\S]*?)\];\s*ids\.forEach/);
if(!refsBlock) fail('cacheRefs id list not found');
else {
  const refIds=[...refsBlock[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
  const missing=refIds.filter(id=>!ids.includes(id));
  if(missing.length) fail(`cacheRefs points to missing DOM ids: ${missing.join(', ')}`);
  else pass(`all ${refIds.length} cached DOM refs exist`);
}

const version=pkg.version;
if(!html.includes(`app.css?v=${version}`) || !html.includes(`app.js?v=${version}`)) fail('HTML asset cache-bust version does not match package version');
else pass(`HTML assets cache-busted at ${version}`);
if(!app.includes(`icons.js?v=${version}`)) fail('icons module cache-bust version mismatch');
else pass('icons module is cache-busted');
if(!sw.includes(`daycraft-v${version}`)) fail('service-worker cache version mismatch');
else pass('service-worker cache version matches package');
if(!sw.includes("fetch(req,{cache:'no-cache'})")) fail('service worker is not network-first/no-cache for online updates');
else pass('service worker prefers fresh network assets');

if(process.exitCode) process.exit(process.exitCode);
console.log('[qa-ui] UI state regression checks passed.');
