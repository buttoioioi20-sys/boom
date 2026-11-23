const $=id=>document.getElementById(id);
const SECS=[["play","Play"],["modules","Modules"],["crosshair","Crosshair"],["mods","Mod Library"],["modpacks","Modpacks"],["resourcepacks","Texture Packs"],["shaders","Shaders"],["datapacks","Datapacks"],["plugins","Plugins"],["servers","Servers"],["wardrobe","Wardrobe"],["accounts","Accounts"],["profiles","Profiles"],["settings","Settings"],["logs","Logs"]];
const S={ver:"1.21.11",view:"play",vers:["1.21.11"],accts:[],acct:0,profs:["Default"],prof:"Default"};
const PRE=["Fabric API","Sodium","Lithium","FerriteCore","ImmediatelyFast","More Culling","Dynamic FPS","ModernFix"];
function toast(m){const t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(toast.k);toast.k=setTimeout(()=>t.style.display="none",4000)}
function side(){$("side").innerHTML='<div class="logo">MILKY<small>CLIENT · v1.0</small></div>'+SECS.map(([k,n],i)=>(i==1?'<div class="sec">LIBRARY</div>':i==8?'<div class="sec">LAUNCHER</div>':'')+`<button class="nav ${S.view==k?'on':''}" onclick="go('${k}')">${n}</button>`).join("")+`<span style="flex:1"></span><button class="chip" style="border:0;color:#a4a4aa;cursor:pointer" onclick="pal()">Ctrl K</button><span class="chip">${S.accts[S.acct]||"Not signed in"}</span>`}
function go(v){S.view=v;side();render()}
const vsel=()=>`<select onchange="S.ver=this.value;render()">${S.vers.map(v=>`<option ${v==S.ver?'selected':''}>${v}</option>`).join("")}</select>`;
const psel=()=>`<select onchange="S.prof=this.value">${S.profs.map(v=>`<option ${v==S.prof?'selected':''}>${v}</option>`).join("")}</select>`;
const asel=()=>`<select onchange="setAcct(this.selectedIndex)">${S.accts.map((a,i)=>`<option ${i==S.acct?'selected':''}>${a}</option>`).join("")||'<option>No account</option>'}</select>`;
async function play(){if(!S.accts.length)return go("accounts");toast("Starting…");try{const r=await api.launch({ver:S.ver,profile:S.prof,idx:S.acct,mem:S.mem});if(r.missing.length)toast("Not available for "+S.ver+": "+r.missing.join(", "))}catch(e){toast(e.message)}}
function render(){const v=S.view,p=$("pg");
if(v=="play"){p.innerHTML=`<div class="hm"><div><div class="mu" style="letter-spacing:4px">FABRIC · ${S.prof.toUpperCase()}</div><h1 style="font-size:60px;line-height:1.02;margin:6px 0 20px">Minecraft<br>${S.ver}</h1>
<div class="tiles2" id="tl"><div class="t2" onclick="go('mods')"><b>Mods</b><span id="c1">…</span></div><div class="t2" onclick="go('shaders')"><b>Shaders</b><span id="c2">…</span></div><div class="t2" onclick="go('resourcepacks')"><b>Textures</b><span id="c3">…</span></div><div class="t2" onclick="go('wardrobe')"><b>Skins</b><span>Closet</span></div></div><div class="card" style="max-width:560px"><b>Always pre-installed</b><br>${PRE.map(m=>`<span class="chip">✓ ${m}</span>`).join("")}</div>
<div class="row" style="max-width:560px"><div class="card" style="flex:1"><b>HUD</b><div class="mu">FPS, keystrokes, music and more.</div><br><button class="b">Edit HUD</button></div><div class="card" style="flex:1"><b>Spotify</b><div class="mu">Show what’s playing</div><br><button class="b">Connect Spotify</button></div></div></div>
<div class="card" style="text-align:center"><div class="char" style="margin:6px auto 10px;height:150px;width:54px"></div><b>${S.accts[S.acct]||"Not signed in"}</b><br><br><button class="b" onclick="go('wardrobe')">Wardrobe</button></div></div>
<div class="dock">${vsel()}${psel()}${asel()}<button class="play" onclick="play()">PLAY</button></div>`;api.counts(S.prof).then(c=>{$("c1").textContent=c.mods+" installed";$("c2").textContent=c.shaders||"None yet";$("c3").textContent=c.textures||"None yet"})}
else if(v=="wardrobe"){wardrobe()}
else if(v=="modules"){modules()}
else if(v=="crosshair"){crosshair()}
else if(v=="logs"){logs()}
else if(v=="settings"){settings()}
else if(v=="accounts"){p.innerHTML=`<h1>Accounts</h1><div class="mu">Switch the account you play on.</div><br>${S.accts.map((a,i)=>`<div class="book"><div class="ic">${a[0]}</div><div><h3>${a}</h3><span class="mu">Microsoft account</span></div><button class="b" onclick="setAcct(${i})">${S.acct==i?'Active':'Use'}</button></div>`).join("")}<button class="b" onclick="addAcct()">+ Add Microsoft account</button>`}
else if(v=="profiles"){p.innerHTML=`<h1>Profiles</h1><div class="mu">Each profile folder keeps its own mods and packs.</div><br>${S.profs.map(a=>`<div class="book"><div class="ic">▤</div><div><h3>${a}</h3></div><button class="b" onclick="api.open('${a}')">Open folder</button></div>`).join("")}`}
else if(v=="servers"){p.innerHTML=`<h1>Servers</h1><div class="mu">Modrinth’s server list has no public API I could confirm.</div><br><button class="b" onclick="location.href='https://modrinth.com/discover/servers?sst=online'">Open Modrinth servers</button>`}
else{lib()}}
async function list(){const q=$("q").value,v=S.view;$("l").textContent="Loading…";
try{const r=await api.search({type:v,query:q,ver:S.ver});S.hits={};r.forEach(m=>S.hits[m.project_id]=m);$("l").innerHTML=r.length?r.map(m=>`<div class="book" style="cursor:pointer" onclick="openBook('${m.project_id}')">${m.icon_url?`<img src="${m.icon_url}" class="ic" style="object-fit:cover">`:`<div class="ic">${m.title[0]}</div>`}<div style="min-width:0"><h3>${m.title}</h3><span class="mu">${m.description}</span></div><span class="mu" style="margin-left:auto">Open ›</span></div>`).join(""):'<div class="mu">Nothing supports this version.</div>'}catch(e){$("l").textContent="Error: "+e.message}}
async function inst(id,type,b){b.textContent="…";const r=await api.install({id,type,ver:S.ver,profile:S.prof});b.textContent=r.ok?"Installed":"Install";toast(r.msg)}
async function addAcct(){try{S.accts=await api.login();render()}catch(e){toast("Sign-in cancelled")}}
S.logs=[];S.mem=localStorage.mem||"4G";api.onLog(m=>{S.logs.push(new Date().toLocaleTimeString()+"  "+m);if(S.logs.length>500)S.logs.shift();toast(m);if(S.view=="logs")logs()});
(async()=>{side();render();try{S.vers=await api.versions();S.ver=S.vers[0]}catch{}S.accts=await api.accounts();side();S.profs=await api.profiles();render();if(!S.accts.length)addAcct()})();

// ---------- Skin gallery ----------
const K=9,VM={anim:"walk",cape:true,rot:28,tilt:-6,zoom:1,sel:null,parts:{}};
function face(el,tex,w,h,d,u,v,e){const z=n=>(n+e)*K/2;
 const F=[[u+d,v,w,d,`rotateX(90deg) translateZ(${z(h)}px)`],[u+d+w,v,w,d,`rotateX(-90deg) translateZ(${z(h)}px)`],[u,v+d,d,h,`rotateY(-90deg) translateZ(${z(w)}px)`],[u+d,v+d,w,h,`translateZ(${z(d)}px)`],[u+d+w,v+d,d,h,`rotateY(90deg) translateZ(${z(w)}px)`],[u+2*d+w,v+d,w,h,`rotateY(180deg) translateZ(${z(d)}px)`]];
 for(const[x,y,fw,fh,t]of F){const f=document.createElement("div"),W=(fw+e)*K,H=(fh+e)*K,sx=(fw+e)/fw,sy=(fh+e)/fh;f.className="fc";
  f.style.cssText=`width:${W}px;height:${H}px;left:calc(50% - ${W/2}px);top:calc(50% - ${H/2}px);background:url(${tex}) -${x*K*sx}px -${y*K*sy}px/${64*K*sx}px ${64*K*sy}px;transform:${t}`;el.appendChild(f)}}
function buildModel(){const st=$("stage");if(!st||!VM.sel)return;const slim=VM.sel.variant=="slim",aw=slim?3:4,tex=VM.sel.data;
 st.innerHTML='<div class="rig"><div class="bob"></div></div>';VM.rig=st.firstChild;VM.bob=VM.rig.firstChild;VM.parts={};
 const P=[["head",8,8,8,0,0,32,0,0,0],["body",8,12,4,16,16,16,32,0,8],["ra",aw,12,4,40,16,40,32,-(4+aw/2),8],["la",aw,12,4,32,48,48,48,4+aw/2,8],["rl",4,12,4,0,16,0,32,-2,20],["ll",4,12,4,16,48,0,48,2,20]];
 for(const[n,w,h,d,u,v,ou,ov,cx,ty]of P){const el=document.createElement("div");el.className="pt";
  el.style.cssText=`width:${w*K}px;height:${h*K}px;left:${(cx-w/2)*K}px;top:${(ty-16)*K}px;transform-origin:50% ${n=="head"||n=="body"?50:0}%`;
  face(el,tex,w,h,d,u,v,0);face(el,tex,w,h,d,ou,ov,.7);VM.bob.appendChild(el);VM.parts[n]=el;
  if(n=="body"&&VM.cape){const c=document.createElement("div");c.style.cssText=`position:absolute;left:calc(50% - ${5*K}px);top:0;width:${10*K}px;height:${16*K}px;background:linear-gradient(#e6e6e6,#9a9a9e);border-radius:3px;transform:translateZ(${-3*K}px) rotateY(180deg);backface-visibility:hidden`;el.appendChild(c)}}}
function tick(t){const r=VM.rig;if(!r||!document.body.contains(r))return;const s=t/1000,A={idle:[4,1.2],walk:[28,4.5],run:[50,8],fly:[10,2]}[VM.anim],sw=Math.sin(s*A[1])*A[0],P=VM.parts;
 r.style.transform=`scale(${VM.zoom}) rotateX(${VM.tilt}deg) rotateY(${VM.rot}deg)`;
 VM.bob.style.transform=VM.anim=="fly"?`rotateX(-80deg) translateY(${Math.sin(s*2)*6}px)`:"none";
 if(P.ra){P.ra.style.transform=`rotateX(${sw}deg)`;P.la.style.transform=`rotateX(${-sw}deg)`;P.rl.style.transform=`rotateX(${-sw}deg)`;P.ll.style.transform=`rotateX(${sw}deg)`}
 requestAnimationFrame(tick)}
const IMG=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src});
async function thumb(data,variant){const i=await IMG(data),c=document.createElement("canvas");c.width=16;c.height=32;const g=c.getContext("2d");g.imageSmoothingEnabled=false;const aw=variant=="slim"?3:4,D=(sx,sy,w,h,dx,dy)=>g.drawImage(i,sx,sy,w,h,dx,dy,w,h);
 for(const o of[0,1]){D(o?40:8,8,8,8,4,0);D(o?20:20,o?36:20,8,12,4,8);D(44,o?36:20,aw,12,4-aw,8);D(o?52:36,o?52:52,aw,12,12,8);D(4,o?36:20,4,12,4,20);D(o?4:20,52,4,12,8,20)}
 return c.toDataURL()}
function card(s,cur){const d=document.createElement("div");d.className="sc"+(VM.sel&&VM.sel.key==s.key?" on":"");d.innerHTML=`<img><div style="min-width:0"><b>${cur?"Wearing now":s.name}</b><span class="mu" style="font-size:12px">${s.variant=="slim"?"Slim":"Classic"} arms</span></div>`;
 thumb(s.data,s.variant).then(u=>d.firstChild.src=u);d.onclick=()=>{VM.sel={...s,cur};paint();buildModel()};return d}
function paint(){const s=VM.sel;if(!s)return;const b=$("wb");b.disabled=!!s.cur&&s.variant==S.curVariant;b.textContent=b.disabled?"Wearing this skin":"Wear this skin";
 $("st").textContent=s.cur?"Wearing now":s.name;document.querySelectorAll("#arms button").forEach(x=>x.classList.toggle("on",x.dataset.v==s.variant));
 document.querySelectorAll(".sc").forEach(x=>x.classList.remove("on"));}
function seg(id,items,cb,on){return`<div class="seg" id="${id}">${items.map(([k,n])=>`<button data-v="${k}" class="${k==on?"on":""}">${n}</button>`).join("")}</div>`}
async function wardrobe(){const p=$("pg");
 p.innerHTML=`<div class="row" style="justify-content:space-between"><h1>Closet</h1><span class="mu">${S.accts[S.acct]||"Not signed in"}</span></div><div class="sk"><div class="vw"><div style="padding:14px 14px 4px">${seg("an",[["idle","Idle"],["walk","Walk"],["run","Run"],["fly","Fly"]],0,VM.anim)}<br>${seg("cp",[["cape","Cape"],["elytra","Elytra"]],0,"cape")}</div><div class="stage" id="stage"></div><div style="padding:16px;border-top:1px solid var(--line)"><b style="font-size:18px">Selected</b> <span class="mu" id="st"></span><br><br>${seg("arms",[["classic","Classic arms"],["slim","Slim arms"]],0,"classic")}<button class="wb" id="wb">Wear this skin</button><p class="mu" style="font-size:12px;margin:10px 0 0">Drag to turn the model · scroll to zoom</p></div></div>
 <div><div class="card"><div class="row" style="justify-content:space-between"><b>My closet</b><span class="row"><button class="b" id="sv">Save current</button><button class="b" id="up" style="background:#f2f2f2;color:#0b0b0c;font-weight:700">+ Upload</button></span></div><br><div class="sg" id="mine"></div></div>
 <div class="card"><div class="row" style="justify-content:space-between"><b>Starter skins</b><span class="row"><input id="un" placeholder="Add by username" style="margin:0;width:160px"><button class="b" id="ad">Add</button></span></div><br><div class="sg" id="mc"></div></div></div></div>`;
 const st=$("stage");let dx=null;st.onpointerdown=e=>{dx=[e.clientX,e.clientY];st.setPointerCapture(e.pointerId)};st.onpointerup=()=>dx=null;
 st.onpointermove=e=>{if(!dx)return;VM.rot+=(e.clientX-dx[0])*.6;VM.tilt=Math.max(-40,Math.min(40,VM.tilt+(e.clientY-dx[1])*.3));dx=[e.clientX,e.clientY]};
 st.onwheel=e=>{e.preventDefault();VM.zoom=Math.max(.6,Math.min(2.2,VM.zoom*(e.deltaY<0?1.08:.93)))};
 $("an").onclick=e=>{if(!e.target.dataset.v)return;VM.anim=e.target.dataset.v;[...$("an").children].forEach(x=>x.classList.toggle("on",x==e.target))};
 $("cp").onclick=e=>{if(!e.target.dataset.v)return;VM.cape=e.target.dataset.v=="cape";[...$("cp").children].forEach(x=>x.classList.toggle("on",x==e.target));buildModel()};
 $("arms").onclick=e=>{if(!e.target.dataset.v||!VM.sel)return;VM.sel.variant=e.target.dataset.v;paint();buildModel()};
 $("wb").onclick=async()=>{const s=VM.sel;toast("Updating skin…");try{toast(await api.skinsWear({idx:S.acct,id:s.id,url:s.url,variant:s.variant}));S.curVariant=s.variant;wardrobe()}catch(e){toast(e.message)}};
 $("up").onclick=async()=>{S.mine=await api.skinsAdd({variant:VM.sel?VM.sel.variant:"classic"});fill()};
 $("sv").onclick=async()=>{try{S.mine=await api.skinsSaveCurrent(S.acct);fill()}catch(e){toast(e.message)}};
 $("ad").onclick=async()=>{try{const x=await api.skinsLookup($("un").value.trim());S.mc=S.mc.filter(m=>m.name!=x.name).concat({...x,key:"mc"+x.name});fill()}catch(e){toast("Player not found")}};
 requestAnimationFrame(tick);
 try{S.mine=await api.skinsList()}catch{S.mine=[]}
 if(!S.mc.length)for(const n of["MHF_Steve","MHF_Alex"])try{const x=await api.skinsLookup(n);S.mc.push({...x,name:n.slice(4),key:"mc"+n})}catch{}
 try{S.cur=await api.skinsCurrent(S.acct);if(S.cur){S.cur.key="cur";S.curVariant=S.cur.variant}}catch{S.cur=null}
 if(!VM.sel||VM.sel.key=="cur")VM.sel=S.cur?{...S.cur,cur:true}:(S.mc[0]||null);
 fill();paint();buildModel()}
function fill(){const m=$("mine"),c=$("mc");if(!m)return;m.innerHTML="";c.innerHTML="";
 if(S.cur)m.appendChild(card(S.cur,true));S.mine.forEach(s=>m.appendChild(card({...s,key:"l"+s.id})));S.mc.forEach(s=>c.appendChild(card(s)))}
S.mc=[];S.mine=[];
let prevView="play";document.addEventListener("keydown",e=>{if(e.key!="Escape")return;if(S.view=="wardrobe")go(prevView);else{prevView=S.view;go("wardrobe")}});

function setAcct(i){S.acct=i;VM.sel=null;S.cur=null;side();render()}

// ---------- Modules (100+ toggles; sample of 48 listed) ----------
const MODS=[["FPS Boost","Performance","Lower overhead per frame"],["Entity Culling","Performance","Skip hidden entities"],["Chunk Optimizer","Performance","Faster chunk meshing"],["Memory Saver","Performance","Trim idle memory"],["Particle Limiter","Performance","Cap particle count"],["Fast Menus","Performance","Lighter screens"],["Smooth Loading","Performance","Spread chunk loads"],["Pause When Unfocused","Performance","Drop FPS in background"],
["Crosshair","PvP","Custom reticle studio"],["Keystrokes","PvP","WASD and mouse display"],["CPS Counter","PvP","Clicks per second"],["Reach Display","PvP","Distance of last hit"],["Combo Counter","PvP","Consecutive hits"],["Armor Status","PvP","Durability on HUD"],["Potion Status","PvP","Active effects"],["Hit Color","PvP","Tint on hit"],["Toggle Sprint","PvP","Hold-free sprint"],["Freelook","PvP","Look around freely"],["Block Overlay","PvP","Outline target block"],["Damage Tint","PvP","Adjust red flash"],
["Zoom","Visual","Smooth scroll zoom"],["Motion Blur","Visual","Subtle blur"],["Time Changer","Visual","Client-side time"],["Weather Changer","Visual","Client-side weather"],["Low Fire","Visual","Smaller fire overlay"],["Nametag Tweaks","Visual","Cleaner nametags"],["Scoreboard Tweaks","Visual","Resize and recolor"],["Cape Display","Visual","See your cape"],
["Waypoints","Utility","Mark and share places"],["Coordinates","Utility","XYZ and direction"],["Minimap","Utility","Corner map"],["FPS Display","Utility","Frame rate on HUD"],["Ping Display","Utility","Latency on HUD"],["Clock","Utility","Real time on HUD"],["Server Address","Utility","Current server"],["Screenshot Tool","Utility","Quick capture"],["Chat Tweaks","Utility","Search and filter chat"],["Quickplay","Utility","Rejoin recent servers"],
["Voice Chat","Social","Proximity voice"],["Friends List","Social","See who is online"],["Spotify Now Playing","Social","Show current song"],["Discord Presence","Social","Rich presence"],["Emotes","Social","Emote wheel"],["Account Switcher","Social","Swap accounts in game"],["Skin Manager","Social","Change skin in game"],["Custom HUD","Utility","Move and style HUDs"]];
const ONDEF={Performance:1};
function getOn(){try{return JSON.parse(localStorage.milkyMods)}catch{const o={};MODS.forEach(m=>o[m[0]]=ONDEF[m[1]]?1:0);return o}}
function setOn(o){localStorage.milkyMods=JSON.stringify(o);api.cfgWrite({profile:S.prof,name:"modules",data:o})}
function modules(){const p=$("pg"),on=getOn();let cat="All",q="";
 p.innerHTML=`<h1>Modules</h1><div class="mu">Toggles are saved to your profile for the in-game mod. <span id="mc"></span></div><div class="row" style="margin-top:12px">${["All","Performance","PvP","Visual","Utility","Social"].map(c=>`<button class="b" data-c="${c}">${c}</button>`).join("")}</div><input id="mq" placeholder="Search modules…"><div class="mg" id="mg"></div>`;
 const draw=()=>{const r=MODS.filter(m=>(cat=="All"||m[1]==cat)&&(m[0]+m[2]).toLowerCase().includes(q));$("mc").textContent=Object.values(on).filter(Boolean).length+" on";
  $("mg").innerHTML=r.map(m=>`<div class="tog"><div><b>${m[0]}</b><small>${m[2]}</small></div><span class="sw ${on[m[0]]?"on":""}" data-n="${m[0]}"></span></div>`).join("")};
 $("mq").oninput=e=>{q=e.target.value.toLowerCase();draw()};
 p.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
 $("mg").onclick=e=>{const n=e.target.dataset.n;if(!n)return;on[n]=on[n]?0:1;setOn(on);if(n=="Crosshair"&&on[n])toast("Open the Crosshair page to design it");draw()};draw()}
// ---------- Crosshair studio ----------
const N=11,gr=f=>{const g=Array(121).fill(0);for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(f(x-5,y-5))g[y*N+x]=1;return g};
const CHP={"Plus":gr((x,y)=>(!x&&Math.abs(y)>=2&&Math.abs(y)<=4)||(!y&&Math.abs(x)>=2&&Math.abs(x)<=4)),"Full plus":gr((x,y)=>(!x&&Math.abs(y)<=4)||(!y&&Math.abs(x)<=4)),"Dot":gr((x,y)=>!x&&!y),"Circle":gr((x,y)=>{const r=Math.hypot(x,y);return r>3.4&&r<4.6}),"Boxed cross":gr((x,y)=>Math.max(Math.abs(x),Math.abs(y))==4||(!x&&Math.abs(y)<=2)||(!y&&Math.abs(x)<=2)),"Tiny":gr((x,y)=>(!x&&Math.abs(y)>=1&&Math.abs(y)<=2)||(!y&&Math.abs(x)>=1&&Math.abs(x)<=2)),"X":gr((x,y)=>Math.abs(x)==Math.abs(y)&&x&&Math.abs(x)<=3),"Diamond":gr((x,y)=>Math.abs(x)+Math.abs(y)==4)};
let CH;try{CH=JSON.parse(localStorage.milkyCH)}catch{}CH=CH||{grid:CHP["Plus"],color:"#ffffff",cm:"blend",tc:"#ff4d4d",scale:3,op:100,ol:true,olc:"#000000",tab:"presets",bg:"grass",target:false,simple:[3,2,1]};
let chT;function chSave(){localStorage.milkyCH=JSON.stringify(CH);clearTimeout(chT);chT=setTimeout(()=>api.cfgWrite({profile:S.prof,name:"crosshair",data:{grid:CH.grid,size:N,color:CH.color,colorMode:CH.cm,targetColor:CH.tc,scale:CH.scale,opacity:CH.op,outline:CH.ol,outlineColor:CH.olc}}),400)}
function drawCH(cv,px,blend){cv.width=cv.height=N*px;const c=cv.getContext("2d"),g=CH.grid;
 if(CH.ol){c.fillStyle=CH.olc;g.forEach((v,i)=>{if(v){const x=i%N,y=i/N|0;for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]])c.fillRect((x+a)*px,(y+b)*px,px,px)}})}
 c.fillStyle=blend&&CH.cm=="blend"?"#fff":CH.cm=="dynamic"&&CH.target?CH.tc:CH.color;g.forEach((v,i)=>{if(v)c.fillRect((i%N)*px,(i/N|0)*px,px,px)})}
const BG={grass:"linear-gradient(#8ec5ff 0 40%,#5aa332 40% 62%,#7a5230 62%)",stone:"repeating-conic-gradient(#8a8a8a 0 25%,#6f6f6f 0 50%) 0 0/46px 46px",sand:"linear-gradient(#e9dba2,#d3c27a)",snow:"linear-gradient(#f4f8ff,#dfe8f5)",night:"linear-gradient(#0a0f24,#1c2447)"};
function chPaint(){const cv=$("pvc");if(!cv)return;drawCH(cv,8,true);const w=N*CH.scale*3;cv.style.cssText=`width:${w}px;height:${w}px;opacity:${CH.op/100};mix-blend-mode:${CH.cm=="blend"?"difference":"normal"}`;$("pv").style.background=BG[CH.bg];
 const ed=$("edc");if(ed){const c=ed.getContext("2d");ed.width=ed.height=264;c.imageSmoothingEnabled=false;const t=document.createElement("canvas");drawCH(t,24,false);c.drawImage(t,0,0,264,264)}chSave()}
function simpleGrid(){const[L,G,T]=CH.simple;CH.grid=gr((x,y)=>{const ax=Math.abs(x),ay=Math.abs(y),h=T>>1,hi=T-1-h;return((x>=-h&&x<=hi)&&ay>G&&ay<=G+L)||((y>=-h&&y<=hi)&&ax>G&&ax<=G+L)})}
function chTab(){const t=CH.tab,b=$("chb");
 b.innerHTML=t=="presets"?`<div class="sg" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr))">${Object.keys(CHP).map(k=>`<div class="sc" style="display:block!important;text-align:center!important" data-p="${k}"><canvas width="44" height="44" data-k="${k}" style="image-rendering:pixelated;width:44px;height:44px"></canvas><b style="font-size:12px">${k}</b></div>`).join("")}</div>`
 :t=="simple"?`<div class="cfg"><label>Arm length</label><input type="range" min="1" max="5" value="${CH.simple[0]}" data-s="0"></div><div class="cfg"><label>Gap</label><input type="range" min="0" max="4" value="${CH.simple[1]}" data-s="1"></div><div class="cfg"><label>Thickness</label><input type="range" min="1" max="3" value="${CH.simple[2]}" data-s="2"></div>`
 :`<div class="row"><canvas id="edc" class="edc"></canvas><div><button class="b" id="ec">Clear</button><br><br><button class="b" id="ei">Invert</button><br><br><label class="mu"><input type="checkbox" id="sym" checked style="width:auto;margin:0 6px 0 0">Mirror</label><p class="mu" style="max-width:170px;font-size:12px">Click and drag to paint. Starting on a filled pixel erases.</p></div></div>`;
 document.querySelectorAll("[data-k]").forEach(c=>{const g=CH.grid;CH.grid=CHP[c.dataset.k];const o=[CH.ol,CH.cm];drawCH(c,4,false);CH.grid=g;c.getContext("2d")});
 b.querySelectorAll("[data-p]").forEach(e=>e.onclick=()=>{CH.grid=CHP[e.dataset.p].slice();chPaint()});
 b.querySelectorAll("[data-s]").forEach(e=>e.oninput=()=>{CH.simple[e.dataset.s]=+e.value;simpleGrid();chPaint()});
 const ed=$("edc");if(ed){let v=null;const set=e=>{const r=ed.getBoundingClientRect(),x=Math.min(10,Math.max(0,(e.clientX-r.left)/r.width*N|0)),y=Math.min(10,Math.max(0,(e.clientY-r.top)/r.height*N|0));if(v===null)v=CH.grid[y*N+x]?0:1;CH.grid[y*N+x]=v;if($("sym").checked){CH.grid[y*N+(10-x)]=v;CH.grid[(10-y)*N+x]=v;CH.grid[(10-y)*N+(10-x)]=v}chPaint()};
  ed.onpointerdown=e=>{ed.setPointerCapture(e.pointerId);v=null;set(e);ed.onpointermove=set};ed.onpointerup=()=>{v=null;ed.onpointermove=null};
  $("ec").onclick=()=>{CH.grid=Array(121).fill(0);chPaint()};$("ei").onclick=()=>{CH.grid=CH.grid.map(x=>x?0:1);chPaint()}}
 document.querySelectorAll("#ct button").forEach(x=>x.classList.toggle("on",x.dataset.v==t));chPaint()}
function crosshair(){const p=$("pg");
 p.innerHTML=`<h1>Crosshair</h1><div class="mu">Design your reticle. It autosaves and syncs to the in-game mod.</div><div class="sk" style="margin-top:14px;grid-template-columns:minmax(300px,380px) 1fr!important"><div class="card" style="order:0"><div class="pv" id="pv"><canvas id="pvc"></canvas></div><div class="seg" id="bgs" style="margin-top:12px">${Object.keys(BG).map(k=>`<button data-v="${k}" class="${k==CH.bg?"on":""}">${k}</button>`).join("")}</div>
 <div class="cfg"><label>Entity targeted</label><span class="sw ${CH.target?"on":""}" id="tg"></span></div>
 <div class="row"><button class="b" id="ex">Copy code</button><input id="im" placeholder="Paste code to import" style="margin:0;flex:1;min-width:120px"><button class="b" id="imb">Import</button></div></div>
 <div class="card"><div class="seg" id="ct">${[["presets","Presets"],["simple","Simple"],["custom","Custom"]].map(([k,n])=>`<button data-v="${k}">${n}</button>`).join("")}</div><div id="chb" style="margin:10px 0 18px"></div>
 <div class="cfg"><label>Color mode</label><div class="seg" id="cm" style="margin:0">${[["blend","Vanilla blending"],["static","Static"],["dynamic","Dynamic"]].map(([k,n])=>`<button data-v="${k}" class="${k==CH.cm?"on":""}">${n}</button>`).join("")}</div></div>
 <div class="cfg"><label>Color</label><input type="color" id="cc" value="${CH.color}"><label style="width:auto">Target</label><input type="color" id="tc" value="${CH.tc}"></div>
 <div class="cfg"><label>Scale</label><input type="range" id="sc" min="1" max="6" value="${CH.scale}"></div><div class="cfg"><label>Opacity</label><input type="range" id="op" min="20" max="100" value="${CH.op}"></div>
 <div class="cfg"><label>Outline</label><span class="sw ${CH.ol?"on":""}" id="ol"></span><input type="color" id="oc" value="${CH.olc}"></div></div></div>`;
 $("ct").onclick=e=>{if(e.target.dataset.v){CH.tab=e.target.dataset.v;chTab()}};
 $("bgs").onclick=e=>{if(e.target.dataset.v){CH.bg=e.target.dataset.v;[...$("bgs").children].forEach(x=>x.classList.toggle("on",x==e.target));chPaint()}};
 $("cm").onclick=e=>{if(e.target.dataset.v){CH.cm=e.target.dataset.v;[...$("cm").children].forEach(x=>x.classList.toggle("on",x==e.target));chPaint()}};
 $("tg").onclick=()=>{CH.target=!CH.target;$("tg").classList.toggle("on",CH.target);chPaint()};$("ol").onclick=()=>{CH.ol=!CH.ol;$("ol").classList.toggle("on",CH.ol);chPaint()};
 $("cc").oninput=e=>{CH.color=e.target.value;chPaint()};$("tc").oninput=e=>{CH.tc=e.target.value;chPaint()};$("oc").oninput=e=>{CH.olc=e.target.value;chPaint()};
 $("sc").oninput=e=>{CH.scale=+e.target.value;chPaint()};$("op").oninput=e=>{CH.op=+e.target.value;chPaint()};
 $("ex").onclick=()=>{const c="MCH1-"+btoa(JSON.stringify({g:CH.grid.join(""),c:CH.color,m:CH.cm,o:CH.ol}));navigator.clipboard&&navigator.clipboard.writeText(c);toast("Code copied")};
 $("imb").onclick=()=>{try{const d=JSON.parse(atob($("im").value.trim().slice(5)));CH.grid=d.g.split("").map(Number);CH.color=d.c;CH.cm=d.m;CH.ol=d.o;crosshair()}catch{toast("That code isn’t valid")}};
 chTab()}
// ---------- Logs ----------
function logs(){const p=$("pg");if(!$("lg")){p.innerHTML=`<h1>Logs</h1><div class="mu">Launcher and game messages.</div><br><div class="logs" id="lg"></div>`}const l=$("lg");l.textContent=S.logs.join("\n")||"Nothing yet. Press Play to start Minecraft.";l.scrollTop=l.scrollHeight}
// ---------- Command palette (Ctrl K) ----------
function cmds(){return[...SECS.map(([k,n])=>["Go to "+n,()=>go(k)]),["Play Minecraft "+S.ver,play],...S.vers.slice(0,15).map(v=>["Switch to "+v,()=>{S.ver=v;render();toast("Version "+v)}])]}
function pal(){let d=$("pal");if(!d){d=document.createElement("div");d.id="pal";d.innerHTML='<div class="pb"><input id="pq" placeholder="Search pages, versions, actions…"><div id="pl"></div></div>';document.body.appendChild(d);
 d.onclick=e=>{if(e.target==d)d.classList.remove("on")};const draw=()=>{const q=$("pq").value.toLowerCase(),r=cmds().filter(c=>c[0].toLowerCase().includes(q)).slice(0,8);$("pl").innerHTML=r.map((c,i)=>`<div class="pi ${i?"":"on"}" data-i="${i}">${c[0]}</div>`).join("");d.r=r};
 $("pq").oninput=draw;$("pq").onkeydown=e=>{if(e.key=="Escape"){e.stopPropagation();d.classList.remove("on")}if(e.key=="Enter"&&d.r[0]){d.classList.remove("on");d.r[0][1]()}};$("pl").onclick=e=>{const i=e.target.dataset.i;if(i!=null){d.classList.remove("on");d.r[i][1]()}};d.draw=draw}
 d.classList.toggle("on");if(d.classList.contains("on")){$("pq").value="";d.draw();$("pq").focus()}}
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=="k"){e.preventDefault();pal()}});
// ---------- First-run setup ----------
function onboard(){if(localStorage.milkyOnboard)return;const d=document.createElement("div");d.id="onb";d.className="on";
 d.innerHTML=`<div class="pb" style="padding:24px"><h2 style="margin:0 0 4px">Welcome to Milky</h2><div class="mu">Pick what you want switched on. You can change all of it later.</div><br>${["Performance","PvP","Visual","Utility","Social"].map(c=>`<label class="tog" style="margin-bottom:8px"><div><b>${c}</b></div><input type="checkbox" value="${c}" ${c=="Performance"?"checked":""} style="width:auto;margin:0"></label>`).join("")}<div class="cfg"><label>Memory</label><select id="ob-m"><option>2G</option><option selected>4G</option><option>6G</option><option>8G</option></select></div><br><button class="wb" id="ob-go">Get started</button></div>`;
 document.body.appendChild(d);$("ob-go").onclick=()=>{const cats=[...d.querySelectorAll("input:checked")].map(x=>x.value),o={};MODS.forEach(m=>o[m[0]]=cats.includes(m[1])?1:0);setOn(o);S.mem=localStorage.mem=$("ob-m").value;localStorage.milkyOnboard=1;d.remove()}}
setTimeout(onboard,600);

// ---------- Backgrounds ----------
const BGS=[["bg2.webp","Snowy forest"],["bg.webp","Cherry blossoms"],["bg3.webp","Soft blossom"]];
function applyBg(){const f=localStorage.bgL||"bg2.webp",v=$("bgv"),r=document.documentElement.style,src=f.replace(".webp",".webm");if(v&&!v.src.endsWith(src)){v.src=src;v.play().catch(()=>{})}r.setProperty("--bgf",f=="bg2.webp"?"saturate(.5) contrast(1.04)":"contrast(1.04)")}
function pushMenuBg(){api.setMenuBg({profile:S.prof,file:localStorage.bgM||"bg2.webp"}).catch(()=>{})}
function settings(){const p=$("pg"),opt=(k,cur)=>`<div class="bgo">${BGS.map(([f,n])=>`<div class="bo ${f==cur?"on":""}" data-k="${k}" data-f="${f}"><img src="${f.replace(".webp","-th.jpg")}"><b>${n}</b></div>`).join("")}</div>`;
 p.innerHTML=`<h1>Settings</h1><div class="mu">Appearance</div><br><b>Launcher background</b>${opt("bgL",localStorage.bgL||"bg2.webp")}<b>In-game main menu background</b>${opt("bgM",localStorage.bgM||"bg2.webp")}<div class="mu">Memory: ${S.mem} · change it in the first-run setup (reset by clearing app data).</div>`;
 p.onclick=e=>{const o=e.target.closest(".bo");if(!o)return;localStorage[o.dataset.k]=o.dataset.f;applyBg();if(o.dataset.k=="bgM")pushMenuBg();settings()}}
applyBg();setTimeout(pushMenuBg,1500);

// ---------- Library: Browse / Installed, books and dressers ----------
const E=x=>String(x==null?"":x).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DIRN={mods:"mods",modpacks:"modpacks",resourcepacks:"resourcepacks",shaders:"shaderpacks",datapacks:"datapacks",plugins:"plugins"};
S.tab={};S.hits={};S.inst=[];
function lib(){const v=S.view,t=SECS.find(x=>x[0]==v)[1],p=$("pg"),tab=S.tab[v]||"browse";
 p.innerHTML=`<h1>${t}</h1><div style="width:42px;height:3px;background:#fff;border-radius:3px;margin:6px 0 12px"></div><div class="mu">Fabric · Minecraft ${S.ver} · things you add join your ${E(S.prof)} profile</div>
 <div class="row" style="margin:16px 0 8px"><div class="seg" id="lt" style="margin:0"><button data-v="browse" class="${tab=="browse"?"on":""}">Browse</button><button data-v="installed" class="${tab=="installed"?"on":""}" id="itab">Installed</button></div><button class="b" style="background:#fff;color:#0b0b0c;font-weight:700" onclick="addFile()">+ Add file</button><button class="b" onclick="api.openSub({profile:S.prof,sub:DIRN[S.view]})">Open folder</button>${vsel()}${psel().replace('onchange="S.prof=this.value"','onchange="S.prof=this.value;render()"')}</div><div class="mu" id="upd" style="margin:8px 0;min-height:20px"></div><div id="lb"></div>`;
 $("lt").onclick=e=>{if(e.target.dataset.v){S.tab[v]=e.target.dataset.v;lib()}};
 if(tab=="browse"){$("lb").innerHTML=`<input id="q" placeholder="Search ${t.toLowerCase()}…" oninput="clearTimeout(S.k);S.k=setTimeout(list,300)"><div id="l"></div>`;list()}else installed()}
async function addFile(){try{toast(await api.addFile({type:S.view,profile:S.prof}))}catch(e){toast(e.message)}S.tab[S.view]="installed";lib()}
const FL={
mods:{sub:"A charm for your world",ep:["Small magic, quietly doing its work.","Made by a stranger who loved this game as much as you do.","Some wonders only ask for a place to rest."]},
modpacks:{sub:"A saga, ready to begin",ep:["An entire adventure, bound in a single volume.","Open it, and the world rearranges itself.","Every great journey begins with one binding."]},
resourcepacks:{sub:"A fresh coat of paint",ep:["Every block remembers how it used to look. Let it forget.","The world, painted by a gentler hand.","Same stones, brand new dreams."]},
shaders:{sub:"A new light for the world",ep:["Let the sun fall differently.","Shadows learn how to breathe.","Even the darkest corners begin to shimmer."]},
datapacks:{sub:"A new rule for the world",ep:["The laws of the world, rewritten in a whisper.","Small rules, strange new worlds.","Bend the world, gently."]},
plugins:{sub:"A spell for your server",ep:["A spell for those who keep the lanterns lit.","Quiet power for the keepers of worlds.","Every server hides a little magic."]}};
const pick=(a,t)=>a[[...String(t)].reduce((h,c)=>h+c.charCodeAt(0),0)%a.length];
async function installed(){const box=$("lb");box.innerHTML='<div class="mu">Opening the cabinets…</div>';let it=[];
 try{it=await api.installed({type:S.view,profile:S.prof,ver:S.ver})}catch(e){toast(e.message)}S.inst=it;if(!$("lb"))return;
 const n=it.filter(x=>x.update).length;$("itab").textContent=`Installed (${it.length})`;
 $("upd").textContent=it.length?(n?`${n} update${n>1?"s":""} waiting for you.`:"Everything is up to date."):"";
 if(!it.length){box.innerHTML='<div class="empty"><div style="font-size:30px">✦</div><b>The cabinets are empty.</b><div class="mu">Wander the Browse shelves and bring home your first treasure, or add a file you already have.</div></div>';return}
 const cabs=[];for(let i=0;i<it.length;i+=5)cabs.push(it.slice(i,i+5));
 box.innerHTML=`<div class="cabs">${cabs.map((c,ci)=>`<div class="cab" style="animation-delay:${ci*120}ms"><div class="top"></div>${c.map((m,i)=>`<div class="dr" style="animation-delay:${ci*120+(i+1)*70}ms" onclick="openDrawer(${ci*5+i})"><div class="hd">${E(m.name)}${m.update?"<i>●</i>":""}</div></div>`).join("")}${Array(5-c.length).fill('<div class="dr em"></div>').join("")}</div>`).join("")}</div>`}
function modal(html,after){closeModal(true);const o=document.createElement("div");o.className="mdl";o.id="mdl";o.innerHTML=html;document.body.appendChild(o);
 o.onclick=e=>{if(e.target==o||e.target.dataset.x)closeModal()};requestAnimationFrame(()=>requestAnimationFrame(()=>o.classList.add("in")));setTimeout(()=>after&&after(o),750)}
function closeModal(now){const o=$("mdl");if(!o)return;if(now){o.remove();return}if(o.closing)return;o.closing=1;const b=o.querySelector(".bk"),d=o.querySelector(".dbx");
 b&&b.classList.remove("open");d&&d.classList.remove("pull");setTimeout(()=>{o.classList.remove("in");setTimeout(()=>o.remove(),450)},(b||d)?850:0)}
window.addEventListener("keydown",e=>{if(e.key=="Escape"&&$("mdl")){e.stopImmediatePropagation();closeModal()}},true);
const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"K":String(n||0);
const sparks=()=>Array.from({length:14},()=>`<i class="sp" style="left:${Math.random()*110-5}%;top:${Math.random()*110-5}%;animation-delay:${Math.random()*3}s;font-size:${8+Math.random()*12}px">✦</i>`).join("");
function openBook(id){const m=S.hits[id];if(!m)return;const f=FL[S.view]||FL.mods;
 modal(`<div class="bkw"><div class="sps">${sparks()}</div><div class="bk" id="bk"><div class="rp"><span class="orn">❖ ❖ ❖</span><div class="chp">Chapter one</div><h3>${E(m.title)}</h3><div class="epi">“${E(pick(f.ep,m.title))}”</div><p>${E(m.description)}</p><div class="chips">${(m.versions||[]).slice(-4).map(x=>`<span>${E(x)}</span>`).join("")}</div><button class="inb" id="bkin">INSTALL <small>bring it into your world</small></button></div>
 <div class="cv"><div class="cf"><div><div class="orn">✦</div><div class="ct">${E(m.title)}</div><div class="orn">✦</div><div class="cs">${E(f.sub)}</div></div></div><div class="cb">${m.icon_url?`<img class="ic2" src="${E(m.icon_url)}">`:`<div class="ic2">${E(m.title[0])}</div>`}<h2>${E(m.title)}</h2><div class="by">written by ${E(m.author)}</div><div class="st">Read ${fmt(m.downloads)} times<br>Cherished by ${fmt(m.follows)}</div><div class="chips">${(m.categories||[]).slice(0,5).map(x=>`<span>${E(x)}</span>`).join("")}</div></div></div></div></div>`,
 o=>{$("bk").classList.add("open")});
 setTimeout(()=>{const b=$("bkin");if(b)b.onclick=async()=>{b.disabled=true;b.textContent="Weaving it into your world…";try{const r=await api.install({id:m.project_id,type:S.view,ver:S.ver,profile:S.prof});b.textContent=r.ok?"It’s yours now ✓":"This page doesn’t exist for "+S.ver+" yet";toast(r.ok?"Tucked into your cabinet":r.msg)}catch(e){b.textContent="INSTALL";b.disabled=false;toast(e.message)}}},100)}
function openDrawer(i){const m=S.inst[i];if(!m)return;const f=FL[S.view]||FL.mods;
 modal(`<div class="dbw"><div class="dbx" id="dbx"><div class="inn"><div class="pp"><div style="display:flex;gap:14px;align-items:center">${m.icon?`<img src="${E(m.icon)}" style="width:56px;height:56px;border-radius:12px;box-shadow:0 4px 10px #0003">`:""}<div><div class="chp">Tucked away in your cabinet</div><h2>${E(m.name)}</h2></div></div><div class="mt">${m.version?"Version "+E(m.version)+" · ":""}${E(m.file)} · ${(m.size/1048576).toFixed(2)} MB</div>${m.update?`<div class="newv">● A newer page is waiting${m.newVersion?": "+E(m.newVersion):""}</div>`:""}<div class="epi">“${E(pick(f.ep,m.name))}”</div><p>${E(m.desc)}</p><div class="ac">${m.update?'<button id="dup">Update</button>':""}<button id="drm" class="g">Remove</button><button class="g" data-x="1">Close</button></div></div></div><div class="fr"><div class="hd">${E(m.name)}</div></div></div></div>`,
 o=>{const d=$("dbx");d.classList.add("shake");setTimeout(()=>{d.classList.remove("shake");d.classList.add("pull")},380)});
 setTimeout(()=>{const u=$("dup"),r=$("drm");if(u)u.onclick=async()=>{u.textContent="Updating…";try{await api.applyUpdate({type:S.view,profile:S.prof,file:m.file,url:m.updUrl,filename:m.updName});toast("A fresh page, neatly filed");closeModal();installed()}catch(e){toast(e.message)}};
  if(r)r.onclick=async()=>{await api.removeFile({type:S.view,profile:S.prof,file:m.file});toast(m.name+" was taken out of the cabinet");closeModal();installed()}},100)}
