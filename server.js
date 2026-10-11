'use strict';
// Pog'ona v5 — nolga bog'liqsiz server (Node 18+). Statik fayllar + reyting API.
const http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto');
const PORT=process.env.PORT||3000,ROOT=path.join(__dirname,'public');
const DATA_DIR=process.env.DATA_DIR||path.join(__dirname,'data'),DB=path.join(DATA_DIR,'users.json');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.ico':'image/x-icon'};
const SEC={'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Strict-Transport-Security':'max-age=31536000; includeSubDomains','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'"};
let users={};try{users=JSON.parse(fs.readFileSync(DB,'utf8'))}catch(e){}
let dirty=false;const save=()=>{dirty=true};
function flush(){if(!dirty)return;dirty=false;try{fs.mkdirSync(DATA_DIR,{recursive:true});const t=DB+'.tmp';fs.writeFileSync(t,JSON.stringify(users));fs.renameSync(t,DB)}catch(e){console.error('saqlash xatosi:',e.message)}}
setInterval(flush,5000).unref();
const hash=t=>crypto.createHash('sha256').update(t).digest('hex');
const clean=s=>String(s||'').replace(/[\u0000-\u001f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,20);
const int=(v,max)=>Math.max(0,Math.min(max,Math.floor(Number(v))||0));
const hits=new Map();
function limited(ip){const n=Date.now(),h=hits.get(ip)||{c:0,t:n};if(n-h.t>60000){h.c=0;h.t=n}h.c++;hits.set(ip,h);return h.c>90}
setInterval(()=>{const n=Date.now();for(const[k,v]of hits)if(n-v.t>60000)hits.delete(k)},60000).unref();
function send(res,code,obj){const b=JSON.stringify(obj);res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...SEC});res.end(b)}
function body(req){return new Promise((ok,no)=>{let d='';req.on('data',c=>{d+=c;if(d.length>4096){no(new Error('katta'));req.destroy()}});req.on('end',()=>{try{ok(JSON.parse(d||'{}'))}catch(e){no(e)}});req.on('error',no)})}
function auth(req,b){const u=users[b.id];const t=(req.headers.authorization||'').replace(/^Bearer /,'');if(!u||!t)return null;const a=Buffer.from(hash(t)),c=Buffer.from(u.h);return a.length===c.length&&crypto.timingSafeEqual(a,c)?u:null}
async function api(req,res,p){
  try{
    if(req.method==='GET'&&p==='/api/leaderboard'){
      const list=Object.entries(users).map(([id,u])=>({id,name:u.name,avatar:u.avatar,xp:u.xp,tests:u.tests,streak:u.streak})).sort((a,b)=>b.xp-a.xp).slice(0,300);
      return send(res,200,{users:list,total:Object.keys(users).length});
    }
    if(req.method!=='POST')return send(res,405,{error:'method'});
    const b=await body(req);
    if(p==='/api/register'){
      if(!/^u_[a-z0-9]{6,24}$/.test(b.id||'')||users[b.id])return send(res,409,{error:'id'});
      if(Object.keys(users).length>=50000)return send(res,503,{error:'limit'});
      let name=clean(b.name);if(name.length<2)return send(res,400,{error:'name'});
      const taken=n=>Object.values(users).some(u=>u.name.toLowerCase()===n.toLowerCase());
      while(taken(name))name=name.slice(0,15)+' '+(100+crypto.randomInt(900));
      const token=crypto.randomBytes(24).toString('hex');
      users[b.id]={name,avatar:String(b.avatar||'🦊').slice(0,8),h:hash(token),xp:0,tests:0,streak:0,day:'',dayXp:0,at:Date.now()};
      save();return send(res,200,{token,name});
    }
    const u=auth(req,b);if(!u)return send(res,401,{error:'auth'});
    if(p==='/api/sync'){
      const today=new Date().toISOString().slice(0,10);if(u.day!==today){u.day=today;u.dayXp=0}
      const want=int(b.xp,10000000);let add=Math.max(0,want-u.xp);add=Math.min(add,800,Math.max(0,4000-u.dayXp));
      u.xp+=add;u.dayXp+=add;u.tests=Math.max(u.tests,Math.min(int(b.tests,100000),u.tests+25));
      u.streak=int(b.streak,3650);if(b.avatar)u.avatar=String(b.avatar).slice(0,8);
      save();return send(res,200,{xp:u.xp});
    }
    if(p==='/api/delete'){delete users[b.id];save();return send(res,200,{ok:1})}
    send(res,404,{error:'yo\'q'});
  }catch(e){send(res,400,{error:'noto\'g\'ri so\'rov'})}
}
const zc=new Map();
function serve(req,res,p){
  let f;try{f=path.normalize(decodeURIComponent(p))}catch(e){res.writeHead(400);return res.end()}
  if(f.endsWith(path.sep)||f==='.')f='index.html';
  let full=path.join(ROOT,f);if(!full.startsWith(ROOT)){res.writeHead(403);return res.end()}
  fs.stat(full,(err,st)=>{
    if(err||!st.isFile()){if(path.extname(f)){res.writeHead(404,SEC);return res.end('404')}full=path.join(ROOT,'index.html');st=fs.statSync(full)}
    const ext=path.extname(full),k=full+st.mtimeMs,h={'Content-Type':MIME[ext]||'application/octet-stream',...SEC,
      'Cache-Control':ext==='.html'||full.endsWith('sw.js')?'no-cache':'public, max-age=86400',Vary:'Accept-Encoding'};
    const gz=/\bgzip\b/.test(req.headers['accept-encoding']||'')&&/html|js|css|svg|json|manifest/.test(ext);
    if(req.method==='HEAD'){res.writeHead(200,h);return res.end()}
    fs.readFile(full,(e,buf)=>{if(e){res.writeHead(500);return res.end()}
      if(gz){let z=zc.get(k);if(!z){z=zlib.gzipSync(buf,{level:9});zc.set(k,z)}h['Content-Encoding']='gzip';res.writeHead(200,h);return res.end(z)}
      res.writeHead(200,h);res.end(buf)});
  });
}
const server=http.createServer((req,res)=>{
  const p=(req.url||'/').split('?')[0];
  if(p==='/healthz'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok')}
  if(p.startsWith('/api/')){const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim();if(limited(ip))return send(res,429,{error:'ko\'p so\'rov'});return api(req,res,p)}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end()}
  serve(req,res,p);
});
server.listen(PORT,'0.0.0.0',()=>console.log('Pog\'ona :'+PORT+' | ma\'lumot: '+DB));
for(const s of['SIGTERM','SIGINT'])process.on(s,()=>{flush();server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),3000).unref()});
