import {initializeApp} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {getFirestore,doc,collection,addDoc,getDocFromServer,runTransaction,onSnapshot,serverTimestamp} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

/* Firestore holds one private atomic household snapshot. Public recipes stay in GitHub. */
const CONFIG_KEY="family-recipes-firebase-config-v1";
const HOUSE_KEY="family-recipes-firebase-household-v1";
const CACHE_KEY="family-recipes-firebase-base:";
const bridge=window.FamilyRecipesHousehold;
const $=id=>document.getElementById(id);
const setStatus=(s,isError=false)=>{const x=$("fb-status");if(x){x.textContent=s;x.style.color=isError?"#a33c2c":""}const n=$("drive-inline-status");if(n)n.textContent=s.length>42?s.slice(0,39)+"…":s};
const parse=(s,fallback)=>{try{return JSON.parse(s)||fallback}catch{return fallback}};
let settings=parse(localStorage.getItem(CONFIG_KEY),{});
const populated=()=>settings.apiKey&&settings.authDomain&&settings.projectId&&settings.appId;
let db=null,auth=null,user=null,householdId=localStorage.getItem(HOUSE_KEY)||"",houseRef=null,unsubscribe=null;
let base=null,busy=false,stalled=false,debounce=0,pending=false;
let lastCloud=null;
function clone(x){return JSON.parse(JSON.stringify(x))}
function equal(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function nonempty(s){return ["lots","plan","shopping","cooked"].some(k=>Array.isArray(s?.[k])&&s[k].length>0)}
function normalize(data){const v=bridge?.normalize(data);if(!v)throw Error("Invalid household data format");return v}
function cacheKey(){return CACHE_KEY+settings.projectId+":"+householdId+":"+(user?.uid||"")}
function loadBase(){base=parse(localStorage.getItem(cacheKey()),null)}
function saveBase(v){base=clone(v);localStorage.setItem(cacheKey(),JSON.stringify(base))}
function requireOnline(){if(!navigator.onLine)throw Error("Offline. Your local changes are saved; reconnect to synchronize.")}
function backupLocal(){
 const snapshot=bridge.snapshot(),url=URL.createObjectURL(new Blob([JSON.stringify(snapshot,null,2)],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="family-recipes-before-firebase-import.json";document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2000)
}
function mapping(items){return new Map((items||[]).map((x,i)=>[String(x.id||"legacy-"+i),x]))}
function merge(baseState,localState,remoteState){
 const merged={version:3};
 for(const key of ["lots","plan","shopping","cooked"]){
  const before=mapping(baseState[key]),mine=mapping(localState[key]),theirs=mapping(remoteState[key]),ids=new Set([...before.keys(),...mine.keys(),...theirs.keys()]);
  const values=[];
  for(const id of ids){
   const b=before.get(id),l=mine.get(id),r=theirs.get(id);
   const lc=!equal(l,b),rc=!equal(r,b);
   if(lc&&rc&&!equal(l,r))return null;
   const resolved=lc?l:(rc?r:b);
   if(resolved!==undefined)values.push(resolved)
  }
  merged[key]=values
 }
 return normalize(merged)
}
function safeSize(x){if(JSON.stringify(x).length>800000)throw Error("Household is approaching Firestore's document size limit. Export data before continuing.")}
function canSync(){return !!(user&&houseRef&&bridge&&base&&!stalled)}
function redraw(){
 if($("fb-user-uid"))$("fb-user-uid").textContent=user?.uid||"Not signed in";
 if($("fb-household-id"))$("fb-household-id").value=householdId;
 if($("fb-current-household"))$("fb-current-household").textContent=householdId?"Household: "+householdId:"No household connected";
 if($("fb-user-name"))$("fb-user-name").textContent=user?.displayName||user?.email||"Not signed in";
 if($("fb-members"))$("fb-members").textContent=lastCloud?.memberUids?.length?lastCloud.memberUids.length+" authorized account(s)":"";
}
function stop(){if(unsubscribe){unsubscribe();unsubscribe=null}houseRef=null;base=null;lastCloud=null;stalled=false;redraw()}
function cloudData(docSnap){
 if(!docSnap.exists())throw Error("Household not found or not accessible.");
 const raw=docSnap.data();return {payload:normalize(raw.data),meta:raw}
}
function takeCloud(){
 if(!lastCloud)return setStatus("No remote household loaded yet.",true);
 if(!confirm("Replace local pantry, shopping, meal plans and cooking history with the private cloud copy? A backup will download first."))return;
 backupLocal();bridge.replace(normalize(lastCloud.data));saveBase(normalize(lastCloud.data));stalled=false;
 setStatus("Cloud household loaded. Synchronization active.");
}
async function flush(){
 if(!canSync()||busy)return;
 busy=true;
 const before=bridge.snapshot();
 try{
  requireOnline();
  const baseline=clone(base);
  const result=await runTransaction(db,async tx=>{
   const snap=await tx.get(houseRef);
   const remote=cloudData(snap).payload;
   const combined=merge(baseline,before,remote);
   if(!combined)throw new Error("Concurrent edit conflict. Download a backup and choose Use cloud copy to resolve.");
   safeSize(combined);
   if(!equal(combined,remote))tx.update(houseRef,{data:combined,updatedAt:serverTimestamp()});
   return combined
  });
  saveBase(result);
  if(equal(bridge.snapshot(),before))bridge.replace(result);
  else pending=true;
  setStatus("Firebase synchronized.");
 }catch(e){
  if(String(e.message||"").includes("conflict"))stalled=true;
  setStatus(e.message||"Sync failed. Local data retained.",true);
 }finally{
  busy=false;
  if(pending&&!stalled){pending=false;setTimeout(flush,500)}
 }
}
function queue(){
 if(!user||!houseRef||stalled)return;
 if(!base)return;
 clearTimeout(debounce);debounce=setTimeout(flush,900)
}
function receive(snap){
 if(snap.metadata.hasPendingWrites||!snap.exists())return;
 let remote;
 try{remote=cloudData(snap)}catch(e){setStatus(e.message,true);return}
 lastCloud={...remote.meta,data:remote.payload};
 redraw();
 if(!base){
  const local=bridge.snapshot();
  if(!nonempty(local)||equal(local,remote.payload)){
   bridge.replace(remote.payload);saveBase(remote.payload);stalled=false;setStatus("Firebase household connected.");
  }else{stalled=true;setStatus("Existing local data differs from the cloud. Use cloud copy (downloads backup) or create a separate household.",true)}
  return;
 }
 const combined=merge(base,bridge.snapshot(),remote.payload);
 if(!combined){stalled=true;setStatus("Conflicting changes on the same pantry record. Export local backup before choosing cloud copy.",true);return}
 if(equal(combined,remote.payload)){
  if(!equal(bridge.snapshot(),remote.payload))bridge.replace(remote.payload);
  saveBase(remote.payload);stalled=false;setStatus("Up to date with household.");
 }else queue();
}
async function connect(id){
 if(!user)throw Error("Sign in first");
 if(!/^[a-zA-Z0-9_-]{5,160}$/.test(id))throw Error("Enter a valid household ID.");
 stop();householdId=id;houseRef=doc(db,"households",id);localStorage.setItem(HOUSE_KEY,id);loadBase();redraw();
 const snap=await getDocFromServer(houseRef);
 if(!snap.exists())throw Error("No accessible household with that ID. The owner must add your UID first.");
 receive(snap);
 unsubscribe=onSnapshot(houseRef,{includeMetadataChanges:false},s=>receive(s),err=>setStatus("Firestore permission or connectivity error: "+err.message,true));
}
async function create(){
 if(!user)return setStatus("Sign in to Google first.",true);
 if(householdId&&houseRef&&!confirm("Create a separate household? The current one stays in Firebase."))return;
 try{
  requireOnline();
  const snapshot=normalize(bridge.snapshot());safeSize(snapshot);
  const newDoc=await addDoc(collection(db,"households"),{
   ownerUid:user.uid,memberUids:[user.uid],data:snapshot,createdAt:serverTimestamp(),updatedAt:serverTimestamp()
  });
  // The creating browser's current state is exactly the newly created remote baseline.
  householdId=newDoc.id;localStorage.setItem(HOUSE_KEY,householdId);saveBase(snapshot);
  await connect(householdId);setStatus("Private household created. Share its ID, then add the other account's UID as a member.");
 }catch(e){setStatus("Create failed: "+(e.message||e),true)}
}
async function addMember(){
 if(!user||!houseRef)return setStatus("Connect a household first.",true);
 const uid=($("fb-member-uid")?.value||"").trim();
 if(!/^[A-Za-z0-9_-]{10,128}$/.test(uid))return setStatus("Paste the other person's Firebase UID, not their email.",true);
 try{
  requireOnline();
  await runTransaction(db,async tx=>{
   const snap=await tx.get(houseRef);
   if(!snap.exists()||snap.data().ownerUid!==user.uid)throw Error("Only the household owner can add members.");
   const members=[...new Set([...snap.data().memberUids,uid])];
   if(members.length>10)throw Error("Household member limit reached.");
   tx.update(houseRef,{memberUids:members,updatedAt:serverTimestamp()})
  });
  setStatus("Member authorized. They can now connect using this household ID.");
 }catch(e){setStatus(e.message||"Could not add member.",true)}
}
async function login(){
 if(!auth)return setStatus("Enter Firebase web app configuration first.",true);
 try{await signInWithPopup(auth,new GoogleAuthProvider())}
 catch(e){setStatus("Google sign-in failed: "+(e.code||e.message)+". Check authorized domains and popup permissions.",true)}
}
function onUser(next){
 user=next;
 if(!user){stop();setStatus(populated()?"Sign in with Google to connect.":"Add Firebase configuration first.");redraw();return}
 redraw();setStatus("Signed in. "+(householdId?"Opening household…":"Create a household or enter an existing ID."));
 if(householdId)connect(householdId).catch(e=>{stop();setStatus(e.message||"Unable to open household.",true)});
}
function configFromUI(){
 const next={
 apiKey:($("fb-api-key")?.value||"").trim(),
 authDomain:($("fb-auth-domain")?.value||"").trim(),
 projectId:($("fb-project-id")?.value||"").trim(),
 appId:($("fb-app-id")?.value||"").trim()
 };
 if(!/^AIza[A-Za-z0-9_-]{15,}$/.test(next.apiKey)||!/^[A-Za-z0-9.-]+\.firebaseapp\.com$/.test(next.authDomain)||
    !/^[A-Za-z0-9-]{4,80}$/.test(next.projectId)||!/^1:[^:]+:web:[a-zA-Z0-9]+$/.test(next.appId))
    return setStatus("Enter the Firebase Web app config: apiKey, authDomain, projectId and appId.",true);
 localStorage.setItem(CONFIG_KEY,JSON.stringify(next));location.reload()
}
async function begin(){
 if(!bridge)return;
 const inputs=[["fb-api-key","apiKey"],["fb-auth-domain","authDomain"],["fb-project-id","projectId"],["fb-app-id","appId"]];
 for(const [name,key] of inputs){const input=$(name);if(input)input.value=settings[key]||""}
 $("fb-save-config")?.addEventListener("click",configFromUI);
 $("fb-sign-in")?.addEventListener("click",login);
 $("drive-inline-connect")?.addEventListener("click",login);
 $("fb-sign-out")?.addEventListener("click",async()=>{if(auth){await signOut(auth);setStatus("Signed out. Local data remains on this device.")}});
 $("fb-create")?.addEventListener("click",create);
 $("fb-connect")?.addEventListener("click",()=>connect(($("fb-household-id")?.value||"").trim()).catch(e=>setStatus(e.message,true)));
 $("fb-copy-id")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(householdId);setStatus("Household ID copied.")}catch{setStatus("Clipboard unavailable.",true)}});
 $("fb-copy-uid")?.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(user?.uid||"");setStatus("Your Firebase UID copied.")}catch{setStatus("Clipboard unavailable.",true)}});
 $("fb-add-member")?.addEventListener("click",addMember);
 $("fb-sync-now")?.addEventListener("click",flush);
 $("fb-use-cloud")?.addEventListener("click",takeCloud);
 window.addEventListener("family-recipes:changed",queue);
 window.addEventListener("online",queue);
 window.addEventListener("focus",()=>{if(user&&houseRef)queue()});
 if(!populated()){setStatus("Local mode. Enter your Firebase Web app configuration to enable shared households.");redraw();return}
 try{
  const fb=initializeApp(settings);
  auth=getAuth(fb);db=getFirestore(fb);
  onAuthStateChanged(auth,onUser,e=>setStatus("Auth error: "+e.message,true));
 }catch(e){setStatus("Firebase configuration error: "+e.message,true)}
}
begin();