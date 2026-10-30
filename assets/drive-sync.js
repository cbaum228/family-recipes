/* Optional household Drive adapter. Uses GIS token flow and per-file Picker; never ships user data to GitHub. */
(() => {
"use strict";
const bridge=window.FamilyRecipesHousehold;
if(!bridge)return;
const CONF="family-recipes-drive-config-v1", BASE="family-recipes-drive-base-";
const API="https://www.googleapis.com/drive/v3/files/",UPLOAD="https://www.googleapis.com/upload/drive/v3/files/";
const SCOPES="https://www.googleapis.com/auth/drive.file";
const $=id=>document.getElementById(id);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let config={},fileId="",token="",expiresAt=0,client=null,working=false,queued=false,debounce=null,signingIn=false;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const label=(msg,bad=false)=>{
 const node=$("drive-status");if(node){node.textContent=msg;node.style.color=bad?"#a33c2c":""}
 const small=$("drive-inline-status");if(small)small.textContent=msg.length>58?msg.slice(0,55)+"…":msg;
};
const parseConfig=()=>{try{return JSON.parse(localStorage.getItem(CONF)||"{}")}catch(_){return {}}};
config=parseConfig();fileId=typeof config.fileId==="string"?config.fileId:"";
function writeConfig(){config.fileId=fileId;localStorage.setItem(CONF,JSON.stringify(config))}
function stateBlank(s){return !["lots","plan","cooked","shopping"].some(k=>Array.isArray(s[k])&&s[k].length)}
function getBase(){try{return JSON.parse(localStorage.getItem(BASE+fileId)||"null")}catch(_){return null}}
function saveBase(state){localStorage.setItem(BASE+fileId,JSON.stringify(state))}
function safe(obj){const s=bridge.normalize(obj);if(!s)throw Error("Selected file is not a valid Family Recipes household JSON file.");return s}
function driveError(res,text){if(res.status===401)token="";throw Error("Drive "+res.status+": "+(text||res.statusText).slice(0,160))}
function hasToken(){if(!token||Date.now()+45000>=expiresAt){token="";return false}return true}
async function api(url,options={}){
 if(!hasToken())throw Error("Google sign-in expired. Select Sign in again.");
 let res;
 try{res=await fetch(url,{...options,headers:{Authorization:"Bearer "+token,...(options.headers||{})},cache:"no-store"})}
 catch(_){throw Error("Drive unreachable. Local changes are retained; reconnect and sync later.")}
 if(!res.ok)driveError(res,await res.text());return res
}
function metaUrl(id){return API+encodeURIComponent(id)+"?fields=id,name,mimeType,version,capabilities(canEdit)"}
async function remoteRead(id=fileId){
 const meta=await(await api(metaUrl(id))).json();
 if(meta.mimeType!=="application/json"||meta.capabilities?.canEdit===false)throw Error("Choose an editable JSON file, not a Google Doc or read-only file.");
 const data=await(await api(API+encodeURIComponent(id)+"?alt=media")).json();
 return {data:safe(data),version:String(meta.version||""),name:meta.name||"Household pantry"};
}
function mapOf(arr){return new Map((arr||[]).map((x,i)=>[String(x.id||"old-"+i),x]))}
/* Conservative three-way merge of ID-based records. Same-record concurrent edits block uploads. */
function merge(base,local,remote){
 const result={version:3};
 for(const key of ["lots","plan","cooked","shopping"]){
  const b=mapOf(base[key]),l=mapOf(local[key]),r=mapOf(remote[key]),all=new Set([...b.keys(),...l.keys(),...r.keys()]),merged=[];
  for(const id of all){
   const before=b.get(id),mine=l.get(id),theirs=r.get(id);
   const lc=!same(mine,before),rc=!same(theirs,before);
   if(lc&&rc&&!same(mine,theirs))return null;
   const chosen=lc?mine:(rc?theirs:before);
   if(chosen!==undefined)merged.push(chosen)
  }
  result[key]=merged
 }
 return safe(result)
}
function applyRemote(remote){bridge.replace(remote);saveBase(remote)}
async function upload(data){
 const res=await api(UPLOAD+encodeURIComponent(fileId)+"?uploadType=media&fields=id,version",{
  method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)
 });
 return res.json()
}
async function synchronize(){
 if(working){queued=true;return}
 if(!fileId||!hasToken())return;
 working=true;
 try{
  label("Checking Google Drive…");
  const latest=await remoteRead(),base=getBase(),local=bridge.snapshot();
  let merged;
  if(base===null){
   if(stateBlank(local)||same(local,latest.data)){applyRemote(latest.data);label("Drive connected — household data loaded");return}
   label("Local data differs from Drive. Choose the household file again to resolve.",true);return;
  }
  merged=merge(base,local,latest.data);
  if(merged===null){label("Conflicting edits detected. Export your local backup before resolving.",true);return}
  if(same(merged,latest.data)){
   if(!same(local,latest.data))applyRemote(latest.data);else saveBase(latest.data);
   label("Synced with Google Drive");return
  }
  // A second version check catches most intervening writes, but Drive JSON is not a transactional DB.
  const check=await(await api(metaUrl(fileId))).json();
  if(String(check.version||"")!==latest.version){queued=true;label("Remote changed during sync; retrying safely.");return}
  const snapshot=merged;
  await upload(snapshot);
  const verify=await remoteRead();
  if(!same(verify.data,snapshot)){label("Another edit occurred during upload. Review both devices before further editing.",true);return}
  saveBase(snapshot);
  if(same(bridge.snapshot(),local)){applyRemote(snapshot)}
  else queued=true; // changes during network request remain local and are retried
  label("Synced with Google Drive");
 }catch(err){label(err.message||"Sync failed; local pantry is still available.",true)}
 finally{working=false;if(queued&&hasToken()){queued=false;setTimeout(()=>synchronize(),1800)}}
}
function schedule(){if(!fileId||!hasToken())return;clearTimeout(debounce);debounce=setTimeout(()=>synchronize(),1300)}
window.addEventListener("family-recipes:changed",schedule);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&hasToken())synchronize()});
window.addEventListener("focus",()=>{if(hasToken())synchronize()});
setInterval(()=>{if(!document.hidden&&hasToken())synchronize()},45000);
function script(src){return new Promise((resolve,reject)=>{const tag=document.createElement("script");tag.src=src;tag.async=true;tag.onload=resolve;tag.onerror=()=>reject(Error("Could not load Google's sign-in or Picker library."));document.head.append(tag)})}
let gisPromise=null,pickerPromise=null;
function ensureGIS(){
 return gisPromise||(gisPromise=script("https://accounts.google.com/gsi/client").then(()=>{if(!window.google?.accounts?.oauth2)throw Error("Google sign-in library unavailable.");return true}).catch(err=>{gisPromise=null;throw err}))
}
async function ensurePicker(){
 if(window.google?.picker)return;
 if(!pickerPromise)pickerPromise=script("https://apis.google.com/js/api.js").then(()=>new Promise((resolve,reject)=>{
  window.gapi.load("picker",{callback:resolve,onerror:()=>reject(Error("Picker failed to load."))})
 })).catch(err=>{pickerPromise=null;throw err});
 return pickerPromise
}
function validClient(){return typeof config.clientId==="string"&&/\.apps\.googleusercontent\.com$/.test(config.clientId)}
async function initializeClient(){
 if(!validClient())throw Error("Save a valid Google OAuth Web client ID in Drive sync settings first.");
 await ensureGIS();
 if(!client)client=google.accounts.oauth2.initTokenClient({
  client_id:config.clientId,scope:SCOPES,
  callback:response=>{
   signingIn=false;
   if(response.error||!response.access_token){label("Google sign-in did not grant Drive access.",true);return}
   token=response.access_token;expiresAt=Date.now()+(Number(response.expires_in)||3300)*1000;
   label(fileId?"Google connected — syncing pantry":"Google connected — create or select a household file");
   if(fileId)synchronize()
  },
  error_callback:()=>{signingIn=false;label("Google sign-in closed or failed.",true)}
 });
}
function signIn(){
 // Called synchronously from a real click; library should be preloaded by settings page.
 if(!client){label("Preparing Google sign-in… click Sign in again.",true);initializeClient().catch(e=>label(e.message,true));return}
 signingIn=true;client.requestAccessToken({prompt:"select_account"})
}
async function newHousehold(){
 try{
  if(!hasToken())throw Error("Sign in with Google first.");
  if(fileId&&!confirm("Create a different household file? Your current shared file will remain in Drive."))return;
  const snapshot=bridge.snapshot(),boundary="fr_"+Math.random().toString(36).slice(2);
  const multipart="--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+
    JSON.stringify({name:"family-recipes-household.json",mimeType:"application/json"})+"\r\n--"+boundary+
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+JSON.stringify(snapshot)+"\r\n--"+boundary+"--";
  const res=await api("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,version",{
   method:"POST",headers:{"Content-Type":"multipart/related; boundary="+boundary},body:multipart
  });
  const meta=await res.json();if(!meta.id)throw Error("Drive did not return a new file ID");
  fileId=meta.id;writeConfig();saveBase(snapshot);display();label("Private household file created. Share it with your spouse as Editor in Drive.");
 }catch(err){label(err.message,true)}
}
async function attach(id){
 try{
  const selected=await remoteRead(id),local=bridge.snapshot(),savedBase=(()=>{
   try{return JSON.parse(localStorage.getItem(BASE+id)||"null")}catch(_){return null}
  })();
  if(!savedBase&&!stateBlank(local)&&!same(local,selected.data)){
   const ok=confirm("This browser has pantry or meal-plan data that differs from Drive. Download a backup and REPLACE this browser's household data with the selected Google Drive file?");
   if(!ok){label("Selection cancelled. Local data unchanged.");return}
   const blob=new Blob([JSON.stringify(local,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
   a.href=url;a.download="family-recipes-before-drive-sync.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)
  }
  fileId=id;writeConfig();display();
  if(savedBase){await synchronize()}
  else{applyRemote(selected.data);label("Selected household file loaded; Drive sync active.")}
 }catch(err){label(err.message,true)}
}
async function chooseFile(){
 try{
  if(!hasToken())throw Error("Sign in first.");
  if(!config.apiKey||!config.projectNumber)throw Error("Save the Picker API key and Cloud project number first.");
  await ensurePicker();
  const view=new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes("application/json");
  const picker=new google.picker.PickerBuilder().addView(view)
    .addView(new google.picker.DocsView(google.picker.ViewId.SHARED_WITH_ME).setMimeTypes("application/json"))
    .setOAuthToken(token).setDeveloperKey(config.apiKey).setAppId(String(config.projectNumber))
    .setOrigin(location.origin)
    .setCallback(async data=>{
      if(data[google.picker.Response.ACTION]!==google.picker.Action.PICKED)return;
      const selected=data[google.picker.Response.DOCUMENTS]?.[0];
      const id=selected?.[google.picker.Document.ID];
      if(id)await attach(id)
    }).build();
  picker.setVisible(true)
 }catch(err){label(err.message,true)}
}
function disconnect(){
 token="";expiresAt=0;client=null;label("Google disconnected on this page; local pantry still available.");display()
}
function display(){
 const id=$("drive-file-id");if(id)id.textContent=fileId?"Connected file: "+fileId:"No Drive file selected";
 const link=$("drive-file-link");if(link){link.hidden=!fileId;if(fileId)link.href="https://drive.google.com/file/d/"+encodeURIComponent(fileId)+"/view"}
 const c=$("drive-client-id"),k=$("drive-api-key"),p=$("drive-project-number");
 if(c&&!c.value)c.value=config.clientId||"";
 if(k&&!k.value)k.value=config.apiKey||"";
 if(p&&!p.value)p.value=config.projectNumber||"";
}
function setup(){
 display();
 const settings=$("drive-save-settings");
 if(settings)settings.addEventListener("click",()=>{
   const clientId=$("drive-client-id")?.value.trim(),apiKey=$("drive-api-key")?.value.trim(),projectNumber=$("drive-project-number")?.value.trim();
   if(!/\.apps\.googleusercontent\.com$/.test(clientId||"")||!/^AIza[0-9A-Za-z_-]+$/.test(apiKey||"")||!/^\d+$/.test(projectNumber||"")){
    label("Enter a valid Web OAuth client ID, Picker API key and numeric Cloud project number.",true);return
   }
   config={...config,clientId,apiKey,projectNumber};client=null;writeConfig();initializeClient().then(()=>label("Configuration saved on this device. Select Sign in with Google.")).catch(e=>label(e.message,true))
 });
 const login=$("drive-login");if(login)login.addEventListener("click",signIn);
 const inline=$("drive-inline-connect");if(inline)inline.addEventListener("click",signIn);
 const create=$("drive-create");if(create)create.addEventListener("click",newHousehold);
 const pick=$("drive-picker");if(pick)pick.addEventListener("click",chooseFile);
 const force=$("drive-sync-now");if(force)force.addEventListener("click",()=>synchronize());
 const signout=$("drive-disconnect");if(signout)signout.addEventListener("click",disconnect);
 if(validClient())initializeClient().then(()=>label(fileId?"Drive configured; sign in to synchronize":"Drive configured; sign in to select a household file")).catch(err=>label(err.message,true));
 else label("Local-only mode — configure Google Drive to enable shared syncing.");
}
setup();
})();