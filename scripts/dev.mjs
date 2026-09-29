import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const root=new URL('../src/',import.meta.url).pathname;
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let p=decodeURIComponent(url.pathname);if(p==='/'||p==='')p='/index.html';let file=normalize(join(root,p));if(!file.startsWith(normalize(root)))throw new Error('bad');try{const s=await stat(file);if(s.isDirectory())file=join(file,'index.html');}catch{file=join(root,'404.html');res.statusCode=404;}const data=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=500;res.end('Server error');}}).listen(port,'127.0.0.1',()=>console.log(`DayCraft: http://127.0.0.1:${port}`));
