const {app,BrowserWindow,ipcMain,dialog,shell}=require("electron");
// ipcMain.handle passes (event, arg); unwrap so every handler receives the arg directly
const _h=ipcMain.handle.bind(ipcMain);ipcMain.handle=(ch,fn)=>_h(ch,(e,a)=>fn(a));
const path=require("path"),fs=require("fs"),crypto=require("crypto");
const {Client}=require("minecraft-launcher-core"),{Auth}=require("msmc");
const UA={"User-Agent":"MilkyClient/1.0 (personal launcher)"};
const root=()=>path.join(app.getPath("userData"),"milky"),pdir=p=>path.join(root(),"profiles",p||"Default");
const AF=()=>path.join(root(),"accounts.json");
const load=()=>{try{return JSON.parse(fs.readFileSync(AF()))}catch{return[]}};
const save=a=>{fs.mkdirSync(root(),{recursive:true});fs.writeFileSync(AF(),JSON.stringify(a))};
const J=async u=>{const r=await fetch(u,{headers:UA});if(!r.ok)throw new Error(r.status+" "+u);return r.json()};
const DIRS={mods:"mods",resourcepacks:"resourcepacks",shaders:"shaderpacks",datapacks:"datapacks",plugins:"plugins",modpacks:"modpacks"};
const DEFAULTS=["fabric-api","sodium","lithium","ferrite-core","immediatelyfast","moreculling","dynamic-fps","modernfix"];
let win;const log=m=>win&&win.webContents.send("log",m);
async function getFile(id,ver,loader){
  let q="game_versions="+encodeURIComponent(JSON.stringify([ver]));
  if(loader)q+="&loaders="+encodeURIComponent(JSON.stringify([loader]));
  const vs=await J(`https://api.modrinth.com/v2/project/${id}/version?${q}`);
  if(!vs.length)return null;return vs[0].files.find(f=>f.primary)||vs[0].files[0];}
async function dl(f,dir){fs.mkdirSync(dir,{recursive:true});const dest=path.join(dir,f.filename);
  if(fs.existsSync(dest))return false;
  const r=await fetch(f.url,{headers:UA});fs.writeFileSync(dest,Buffer.from(await r.arrayBuffer()));return true;}
async function ensureDefaults(ver,profile){const missing=[];
  for(const s of DEFAULTS){try{const f=await getFile(s,ver,"fabric");
    if(!f){missing.push(s);continue}
    if(await dl(f,path.join(pdir(profile),"mods")))log("Installed "+s);}catch{missing.push(s)}}
  return missing;}
async function session(idx){const a=load(),acc=a[idx];if(!acc)throw new Error("Add a Microsoft account first");
  const x=await new Auth("select_account").refresh(acc.save);const mc=await x.getMinecraft();
  a[idx].save=x.save();save(a);return mc;}
ipcMain.handle("versions",async()=>(await J("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).versions.filter(v=>v.type==="release").map(v=>v.id));
ipcMain.handle("search",async({type,query,ver})=>{
  const F=[[`project_type:${type==="datapacks"||type==="plugins"?"mod":type==="mods"?"mod":type==="modpacks"?"modpack":type==="shaders"?"shader":"resourcepack"}`]];
  if(ver)F.push([`versions:${ver}`]);
  if(type==="mods")F.push(["categories:fabric"]);
  if(type==="datapacks")F.push(["categories:datapack"]);
  if(type==="plugins")F.push(["categories:paper","categories:spigot","categories:bukkit"]);
  const u=`https://api.modrinth.com/v2/search?query=${encodeURIComponent(query||"")}&limit=30&facets=${encodeURIComponent(JSON.stringify(F))}`;
  return (await J(u)).hits;});
ipcMain.handle("install",async({id,type,ver,profile})=>{
  const f=await getFile(id,ver,type==="mods"?"fabric":null);
  if(!f)return{ok:false,msg:"No file for "+ver};
  await dl(f,path.join(pdir(profile),DIRS[type]));return{ok:true,msg:"Installed "+f.filename};});
ipcMain.handle("accounts",()=>load().map(a=>a.name));
ipcMain.handle("login",async()=>{const x=await new Auth("select_account").launch("electron");
  const mc=await x.getMinecraft();const a=load();
  if(!a.find(z=>z.name===mc.profile.name))a.push({name:mc.profile.name,save:x.save()});save(a);return a.map(z=>z.name);});
ipcMain.handle("profiles",()=>{const d=path.join(root(),"profiles");fs.mkdirSync(path.join(d,"Default"),{recursive:true});return fs.readdirSync(d);});
ipcMain.handle("open",p=>{fs.mkdirSync(pdir(p),{recursive:true});shell.openPath(pdir(p));});
const SK=()=>path.join(root(),"skins"),SI=()=>path.join(SK(),"index.json");
const idx=()=>{try{return JSON.parse(fs.readFileSync(SI()))}catch{return[]}};
const wIdx=a=>{fs.mkdirSync(SK(),{recursive:true});fs.writeFileSync(SI(),JSON.stringify(a))};
const durl=b=>"data:image/png;base64,"+b.toString("base64");
const lib=()=>idx().map(s=>({...s,data:durl(fs.readFileSync(path.join(SK(),s.id+".png")))}));
const png=async u=>Buffer.from(await (await fetch(u,{headers:UA})).arrayBuffer());
function addLib(buf,name,variant){const id=Date.now().toString(36);fs.mkdirSync(SK(),{recursive:true});fs.writeFileSync(path.join(SK(),id+".png"),buf);const a=idx();a.push({id,name,variant});wIdx(a);}
async function current(i){const mc=await session(i);const p=await (await fetch("https://api.minecraftservices.com/minecraft/profile",{headers:{Authorization:"Bearer "+mc.mcToken}})).json();
  const s=(p.skins||[]).find(x=>x.state==="ACTIVE")||(p.skins||[])[0];if(!s)return null;
  return{name:p.name,url:s.url,variant:s.variant==="SLIM"?"slim":"classic",data:durl(await png(s.url))};}
ipcMain.handle("skinsList",()=>lib());
ipcMain.handle("skinsAdd",async({variant})=>{const {filePaths}=await dialog.showOpenDialog(win,{filters:[{name:"PNG skin",extensions:["png"]}],properties:["openFile"]});
  if(filePaths&&filePaths[0])addLib(fs.readFileSync(filePaths[0]),path.basename(filePaths[0],".png"),variant);return lib();});
ipcMain.handle("skinsCurrent",i=>current(i));
ipcMain.handle("skinsSaveCurrent",async i=>{const c=await current(i);if(c)addLib(Buffer.from(c.data.split(",")[1],"base64"),c.name+" (saved)",c.variant);return lib();});
ipcMain.handle("skinsLookup",async n=>{const u=(await J("https://api.mojang.com/users/profiles/minecraft/"+encodeURIComponent(n))).id;
  const pr=await J("https://sessionserver.mojang.com/session/minecraft/profile/"+u);
  const t=JSON.parse(Buffer.from(pr.properties[0].value,"base64").toString()).textures.SKIN;
  return{name:pr.name,url:t.url,variant:t.metadata&&t.metadata.model==="slim"?"slim":"classic",data:durl(await png(t.url))};});
ipcMain.handle("skinsWear",async({idx:i,id,url,variant})=>{const mc=await session(i),H={Authorization:"Bearer "+mc.mcToken};let r;
  if(id){const fd=new FormData();fd.append("variant",variant);fd.append("file",new Blob([fs.readFileSync(path.join(SK(),id+".png"))],{type:"image/png"}),"skin.png");
    r=await fetch("https://api.minecraftservices.com/minecraft/profile/skins",{method:"POST",headers:H,body:fd});}
  else r=await fetch("https://api.minecraftservices.com/minecraft/profile/skins",{method:"POST",headers:{...H,"Content-Type":"application/json"},body:JSON.stringify({variant,url})});
  return r.ok?"Skin updated":"Skin change failed ("+r.status+")";});
ipcMain.handle("setMenuBg",({profile,file})=>{const d=path.join(pdir(profile),"config","milkyclient");fs.mkdirSync(d,{recursive:true});
  const base=file.replace(".webp","");fs.copyFileSync(path.join(__dirname,"renderer",base+".webm"),path.join(d,"menu-bg.webm"));fs.copyFileSync(path.join(__dirname,"renderer",base+"-still.png"),path.join(d,"menu-bg.png"));fs.writeFileSync(path.join(d,"theme.json"),JSON.stringify({menuBackground:"menu-bg.png",menuBackgroundVideo:"menu-bg.webm"}));return true});
const LOAD={mods:["fabric"],resourcepacks:["minecraft"],shaders:["iris","optifine","canvas","vanilla"],datapacks:["datapack"],plugins:["paper","spigot","bukkit","purpur","folia"],modpacks:["fabric","forge","neoforge","quilt"]};
const post=async(u,b)=>{const r=await fetch(u,{method:"POST",headers:{...UA,"Content-Type":"application/json"},body:JSON.stringify(b)});return r.ok?r.json():{}};
ipcMain.handle("installed",async({type,profile,ver})=>{
  const dir=path.join(pdir(profile),DIRS[type]);let files=[];
  try{files=fs.readdirSync(dir).filter(f=>fs.statSync(path.join(dir,f)).isFile())}catch{}
  const items=files.map(f=>{const b=fs.readFileSync(path.join(dir,f));return{file:f,size:b.length,hash:crypto.createHash("sha1").update(b).digest("hex")}});
  if(!items.length)return[];
  let vm={},pm={},up={};
  try{const hashes=items.map(i=>i.hash);
    vm=await post("https://api.modrinth.com/v2/version_files",{hashes,algorithm:"sha1"});
    const ids=[...new Set(Object.values(vm).map(v=>v.project_id))];
    if(ids.length)(await J("https://api.modrinth.com/v2/projects?ids="+encodeURIComponent(JSON.stringify(ids)))).forEach(p=>pm[p.id]=p);
    up=await post("https://api.modrinth.com/v2/version_files/update",{hashes,algorithm:"sha1",loaders:LOAD[type],game_versions:[ver]});
  }catch{}
  return items.map(i=>{const v=vm[i.hash],p=v&&pm[v.project_id],u=up[i.hash],uf=u&&(u.files.find(f=>f.primary)||u.files[0]);
    return{file:i.file,size:i.size,name:p?p.title:i.file,desc:p?p.description:"Not found on Modrinth, so no description is available.",icon:p&&p.icon_url,version:v&&v.version_number,
      update:!!(u&&v&&u.id!==v.id),newVersion:u&&u.version_number,updUrl:uf&&uf.url,updName:uf&&uf.filename};});});
ipcMain.handle("removeFile",({type,profile,file})=>{fs.unlinkSync(path.join(pdir(profile),DIRS[type],path.basename(file)));return true});
ipcMain.handle("applyUpdate",async({type,profile,file,url,filename})=>{const dir=path.join(pdir(profile),DIRS[type]);await dl({url,filename},dir);
  if(filename!==file)fs.unlinkSync(path.join(dir,path.basename(file)));return true});
ipcMain.handle("addFile",async({type,profile})=>{const ex={mods:["jar"],plugins:["jar"],modpacks:["mrpack","zip"]}[type]||["zip"];
  const {filePaths}=await dialog.showOpenDialog(win,{filters:[{name:type,extensions:ex}],properties:["openFile","multiSelections"]});
  if(!filePaths||!filePaths.length)return"Cancelled";const dir=path.join(pdir(profile),DIRS[type]);fs.mkdirSync(dir,{recursive:true});
  filePaths.forEach(f=>fs.copyFileSync(f,path.join(dir,path.basename(f))));return"Added "+filePaths.length+" file(s)"});
ipcMain.handle("openSub",({profile,sub})=>{const d=path.join(pdir(profile),sub);fs.mkdirSync(d,{recursive:true});shell.openPath(d)});
ipcMain.handle("counts",p=>{const c=d=>{try{return fs.readdirSync(path.join(pdir(p),d)).length}catch{return 0}};return{mods:c("mods"),shaders:c("shaderpacks"),textures:c("resourcepacks")}});
ipcMain.handle("cfgWrite",({profile,name,data})=>{const d=path.join(pdir(profile),"config","milkyclient");fs.mkdirSync(d,{recursive:true});fs.writeFileSync(path.join(d,name+".json"),JSON.stringify(data));return true});
ipcMain.handle("launch",async({ver,profile,idx,mem})=>{
  const mc=await session(idx);log("Checking pre-installed mods…");
  const missing=await ensureDefaults(ver,profile);
  const lv=(await J(`https://meta.fabricmc.net/v2/versions/loader/${ver}`))[0].loader.version,id=`fabric-loader-${lv}-${ver}`;
  const game=path.join(root(),"game"),vd=path.join(game,"versions",id);fs.mkdirSync(vd,{recursive:true});
  fs.writeFileSync(path.join(vd,id+".json"),JSON.stringify(await J(`https://meta.fabricmc.net/v2/versions/loader/${ver}/${lv}/profile/json`)));
  const l=new Client();l.on("progress",p=>log(`Downloading ${p.type} ${p.task}/${p.total}`));l.on("debug",m=>log(String(m)));
  l.launch({authorization:mc.mclc(),root:game,version:{number:ver,type:"release",custom:id},memory:{max:mem||"4G",min:"2G"},overrides:{gameDirectory:pdir(profile)}}).catch(e=>log("Launch error: "+e.message));
  return{missing};});
app.whenReady().then(()=>{win=new BrowserWindow({width:1180,height:760,backgroundColor:"#0b0b0c",autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,"preload.js")}});win.loadFile("renderer/index.html");});
app.on("window-all-closed",()=>app.quit());
