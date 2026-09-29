import { cp, rm, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const root=new URL('../',import.meta.url).pathname;
const src=join(root,'src'),dist=join(root,'dist');
await rm(dist,{recursive:true,force:true}); await mkdir(dist,{recursive:true}); await cp(src,dist,{recursive:true});
const repo=process.env.GITHUB_REPOSITORY || 'ko9ma7/daycraft-planner';
const [owner,name]=repo.split('/');
const custom=process.env.SITE_URL?.trim();
const siteUrl=(custom || `https://${owner}.github.io/${name}/`).replace(/\/*$/,'/');
for(const file of ['index.html','robots.txt','sitemap.xml']){const path=join(dist,file);let text=await readFile(path,'utf8');text=text.replaceAll('__SITE_URL__',siteUrl);await writeFile(path,text);}
console.log(`Built DayCraft -> dist/ (${siteUrl})`);
