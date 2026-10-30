/* Family Recipes: no backend, accounts, external scripts, or data uploads. */
(() => {
"use strict";
const KEY="family-recipes-household-v2";
const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=String(text);if(cls)n.className=cls;return n};
const fmt=(n,u)=>new Intl.NumberFormat("en-US",{maximumFractionDigits:n<10?1:0}).format(Math.max(0,n))+" "+u;
const ID=()=>typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2);
const validServings=n=>{const v=Number(n);return Number.isFinite(v)&&v>=.5&&v<=50?Math.round(v*2)/2:null};
const empty=()=>({version:2,lots:[],plan:[],cooked:[]});
let state=empty(),recipes=[],recipeById=new Map(),foods=new Map();
function safeState(obj){
  if(!obj||!Array.isArray(obj.lots)||!Array.isArray(obj.plan)||!Array.isArray(obj.cooked))return null;
  const lots=obj.lots.slice(0,3000).filter(x=>x&&typeof x.key==="string"&&x.key.length<180&&["g","ml"].includes(x.unit)&&Number.isFinite(Number(x.qty))&&Number(x.qty)>=0&&Number(x.qty)<1e8).map(x=>({id:String(x.id||ID()),key:x.key,name:String(x.name||x.key).slice(0,160),unit:x.unit,qty:Number(x.qty),expires:/^\d{4}-\d{2}-\d{2}$/.test(x.expires||"")?x.expires:"",aisle:String(x.aisle||"Other").slice(0,70)}));
  const plan=obj.plan.slice(0,500).filter(x=>x&&typeof x.recipeId==="string"&&validServings(x.servings??(x.meals!=null?Number(x.meals)*2.1:NaN))!==null).map(x=>({id:String(x.id||ID()),recipeId:x.recipeId,servings:validServings(x.servings??(x.meals!=null?Number(x.meals)*2.1:NaN)),day:String(x.day||"").slice(0,30)}));
  const cooked=obj.cooked.slice(-300).filter(x=>x&&typeof x.recipeId==="string").map(x=>({recipeId:x.recipeId,date:String(x.date||"").slice(0,10),category:String(x.category||"").slice(0,60)}));
  return {version:2,lots,plan,cooked};
}
try{const p=localStorage.getItem(KEY);if(p)state=safeState(JSON.parse(p))||empty()}catch(_){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(_){return false}}
function amountRequired(r,m){return(r.ingredients||[]).map(i=>({...i,need:Number(i.amount)*m/Number(r.servings||1)})).filter(i=>Number.isFinite(i.need)&&i.need>0)}
function ikey(i){return String(i.shopping_key||i.name).trim().toLowerCase()+"|"+String(i.unit||"g")}
function available(i){const k=ikey(i);return state.lots.reduce((s,l)=>s+(l.key===k?l.qty:0),0)}
function daysLeft(iso){if(!iso)return null;const d=new Date(iso+"T12:00:00"),now=new Date();now.setHours(12,0,0,0);return Number.isFinite(d.getTime())?Math.round((d-now)/86400000):null}
function expiryLabel(iso){const d=daysLeft(iso);return d===null?"No date":d<0?"Past your use-by date":d===0?"Use today":d===1?"Use tomorrow":d<=7?"Use in "+d+" days":"Use by "+iso}
function download(filename,text,mime="application/json"){const url=URL.createObjectURL(new Blob([text],{type:mime}));const a=el("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
async function copy(txt){await navigator.clipboard.writeText(txt)}
const clear=node=>node.replaceChildren();
const message=(id,text)=>{const n=$(id);if(n)n.textContent=text};
function buildFoods(){
  for(const r of recipes)for(const i of r.ingredients||[]){if(!i.shopping_key||!["g","ml"].includes(i.unit))continue;const key=ikey(i);
    if(!foods.has(key))foods.set(key,{key,name:i.shopping_name||i.name,unit:i.unit,aisle:i.aisle||"Other"})}
}
function option(sel,value,text){const o=el("option",text);o.value=value;sel.append(o)}
function setPantryOptions(){
  const s=$("pantry-food");if(!s)return;clear(s);
  const ordered=[...foods.values()].sort((a,b)=>a.name.localeCompare(b.name));
  for(const f of ordered)option(s,f.key,f.name+" ("+f.unit+")");
  s.addEventListener("change",()=>{const food=foods.get(s.value);if(food)$("pantry-unit").value=food.unit});
  if(ordered.length){$("pantry-unit").value=ordered[0].unit}
}
function renderPantry(){
 const holder=$("pantry-list");if(!holder)return;clear(holder);
 if(!state.lots.length){holder.append(el("p","Pantry is empty. Add an ingredient above. Quantities stay on this device.","muted"));return}
 const sorted=[...state.lots].sort((a,b)=>(a.expires||"9999").localeCompare(b.expires||"9999")||a.name.localeCompare(b.name));
 for(const l of sorted){const row=el("div",null,"inventory-row"),details=el("div");
 const title=el("strong",l.name);const sub=el("div",fmt(l.qty,l.unit)+" · "+expiryLabel(l.expires),"muted");details.append(title,sub);
 const actions=el("div",null,"row-actions");
 const qty=el("input");qty.type="number";qty.min="0";qty.step="any";qty.value=l.qty;qty.setAttribute("aria-label","Quantity of "+l.name);
 qty.addEventListener("change",()=>{let v=Number(qty.value);if(!Number.isFinite(v)||v<0){qty.value=l.qty;return}l.qty=v;save();renderPantry();renderSuggestions();renderShopping()});
 const remove=el("button","Remove","light");remove.addEventListener("click",()=>{state.lots=state.lots.filter(x=>x.id!==l.id);save();renderPantry();renderSuggestions();renderShopping()});
 actions.append(qty,el("span",l.unit,"muted"),remove);row.append(details,actions);holder.append(row)}
}
function addPantry(){
 const f=foods.get($("pantry-food").value),qty=Number($("pantry-amount").value),expires=$("pantry-expires").value;
 if(!f||!Number.isFinite(qty)||qty<=0){message("pantry-status","Choose a listed ingredient and enter a positive quantity.");return}
 state.lots.push({id:ID(),key:f.key,name:f.name,unit:f.unit,qty,expires,aisle:f.aisle});
 save();renderPantry();renderSuggestions();renderShopping();message("pantry-status",f.name+" added. A separate lot is retained so use-by dates stay meaningful.");
}
function suggest(r,servings){
 const ing=amountRequired(r,servings);
 if(!ing.length)return null;
 let weight=0,covered=0,full=0,near=false,anyStock=false;
 const missing=[];
 for(const i of ing){
   const have=available(i),w=Math.sqrt(i.need),coverage=Math.min(1,have/i.need);
   weight+=w;covered+=w*coverage;if(have>=i.need-.01)full++;else missing.push({name:i.shopping_name||i.name,missing:i.need-have,unit:i.unit});
   if(have>0){anyStock=true;const urgent=state.lots.some(l=>l.key===ikey(i)&&l.qty>0&&daysLeft(l.expires)!==null&&daysLeft(l.expires)<=5);if(urgent)near=true}
 }
 const coverage=weight?covered/weight:0;
 const recent=state.cooked.slice(-4).some(c=>c.category===r.category);
 const urgency=near?8:0,variety=recent?0:5;
 const score=Math.round(coverage*87+urgency+variety);
 return {r,score,coverage,full,total:ing.length,missing,near,anyStock};
}
function renderSuggestions(){
 const target=$("suggestions");if(!target||!recipes.length)return;clear(target);
 const servings=validServings($("suggest-servings").value)||5;
 const scored=recipes.map(r=>suggest(r,servings)).filter(Boolean).sort((a,b)=>b.score-a.score||a.missing.length-b.missing.length);
 for(const x of scored){
 const card=el("article",null,"recipe-card");const headline=el("h3"),link=el("a",x.r.name);link.href=x.r.url;headline.append(link);
 card.append(el("div",x.r.category+" · "+x.full+"/"+x.total+" ingredients fully covered","eyebrow"),headline);
 const meter=el("div",null,"meter"),fill=el("div");fill.style.width=Math.round(x.coverage*100)+"%";meter.append(fill);card.append(meter);
 card.append(el("p",Math.round(x.coverage*100)+"% quantity-weighted pantry coverage"+(x.near?" · Uses an ingredient nearing its use-by date":"")+".","muted"));
 if(x.missing.length)card.append(el("p","Still needed: "+x.missing.slice(0,4).map(y=>y.name+" ("+fmt(y.missing,y.unit)+")").join(", ")+(x.missing.length>4?" …":""),"muted"));
 else card.append(el("p","All required ingredient quantities are accounted for.","ready"));
 const macro=Boolean(x.r.nutrition_verified);
 card.append(el("small",macro?"Verified macros available":"Macros not verified: excluded from ranking","muted"));
 const add=el("button","Plan "+servings+" family servings","light");add.addEventListener("click",()=>{state.plan.push({id:ID(),recipeId:x.r.id,servings,day:""});save();message("pantry-status","Added "+x.r.name+" to meal planner.");});
 card.append(add);target.append(card)
 }
}
function mergedPlan(){
 const map=new Map();
 for(const p of state.plan){
  const r=recipeById.get(p.recipeId);if(!r)continue;
  for(const i of amountRequired(r,p.servings)){
    if(i.shopping_key==="water")continue;
    const key=ikey(i);
    if(!map.has(key))map.set(key,{key,name:i.shopping_name||i.name,unit:i.unit,aisle:i.aisle||"Other",needed:0});
    map.get(key).needed+=i.need;
  }
 }
 return [...map.values()].sort((a,b)=>a.aisle.localeCompare(b.aisle)||a.name.localeCompare(b.name))
}
function renderPlan(){
 const target=$("planned-list");if(!target)return;clear(target);
 if(!state.plan.length){target.append(el("p","No recipes planned yet. Add a recipe above, or from a recipe page.","muted"));return}
 for(const p of state.plan){
 const r=recipeById.get(p.recipeId);if(!r)continue;
 const line=el("div",null,"inventory-row"),content=el("div"),a=el("a",r.name);a.href=r.url;
 content.append(a,el("div",p.servings+" family servings"+(p.day?" · "+p.day:""),"muted"));
 const controls=el("div",null,"row-actions"),n=el("input");n.type="number";n.min=".5";n.max="50";n.step=".5";n.value=p.servings;n.setAttribute("aria-label","Family servings of "+r.name);
 n.addEventListener("change",()=>{const v=validServings(n.value);if(v===null){n.value=p.servings;return}p.servings=v;save();renderPlan();renderShopping()});
 const rm=el("button","Remove","light");rm.addEventListener("click",()=>{state.plan=state.plan.filter(x=>x.id!==p.id);save();renderPlan();renderShopping()});
 controls.append(n,rm);line.append(content,controls);target.append(line)
 }
}
function renderShopping(){
 const target=$("shopping-list");if(!target)return;clear(target);
 const ingredients=mergedPlan();if(!ingredients.length){target.append(el("p","Choose at least one recipe to build a shopping list.","muted"));return}
 for(const i of ingredients){
 const buy=Math.max(0,i.needed-available(i)),line=el("div",null,"inventory-row"),detail=el("div");
 detail.append(el("strong",i.name),el("div","Recipe total: "+fmt(i.needed,i.unit)+" · On hand: "+fmt(available(i),i.unit),"muted"));
 line.append(detail,el("strong",buy>.01?fmt(buy,i.unit)+" to buy":"Already stocked",buy>.01?"":"ready"));target.append(line)
 }
}
function shoppingRows(){return mergedPlan().map(i=>({...i,onHand:available(i),buy:Math.max(0,i.needed-available(i))})).filter(i=>i.buy>.01)}
function textShopping(){const rows=shoppingRows();return rows.length?"Shopping list\n"+rows.map(i=>"☐ "+i.name+": "+fmt(i.buy,i.unit)).join("\n"):"Nothing to buy for the selected recipes."}
// AnyList bulk paste expects one item per line, with no headings or checkbox glyphs.
// Put units first for ingredient-style parsing. AnyList quantity-field recognition still needs live verification.
function anylistShopping(){return shoppingRows().map(i=>`${Math.ceil(i.buy)} ${i.unit} ${i.name}`).join("\n")}
const csvCell=s=>{let v=String(s);if(/^[=+@\\-]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'}
function csvShopping(){return ["Department,Ingredient,Needed,On hand,To buy,Unit",...shoppingRows().map(i=>[i.aisle,i.name,i.needed.toFixed(1),i.onHand.toFixed(1),i.buy.toFixed(1),i.unit].map(csvCell).join(","))].join("\r\n")+"\r\n"}
function cookFirst(){
 const p=state.plan[0];if(!p){message("planner-status","Add a recipe first.");return}
 const r=recipeById.get(p.recipeId);if(!r)return;
 if(!confirm("Mark "+r.name+" as cooked and subtract its available ingredients from this device's pantry? Check actual amounts used before confirming."))return;
 for(const i of amountRequired(r,p.servings)){
   let left=i.need;const lots=state.lots.filter(l=>l.key===ikey(i)).sort((a,b)=>(a.expires||"9999").localeCompare(b.expires||"9999"));
   for(const lot of lots){const used=Math.min(lot.qty,left);lot.qty-=used;left-=used;if(left<=0)break}
 }
 state.lots=state.lots.filter(l=>l.qty>.001);state.cooked.push({recipeId:r.id,category:r.category,date:new Date().toISOString().slice(0,10)});
 state.plan.shift();save();renderPlan();renderShopping();message("planner-status","Marked cooked. Pantry quantities subtracted where available; check any substitutions manually.");
}
function initIndex(){const search=$("recipe-search"),cards=[...document.querySelectorAll(".recipe-card[data-search]")];if(!search)return;const filter=()=>{let shown=0;for(const c of cards){c.hidden=!c.dataset.search.includes(search.value.toLowerCase().trim());if(!c.hidden)shown++}const none=$("no-matches");if(none)none.hidden=shown!==0};search.addEventListener("input",filter)}
function initRecipe(){
 const wrapper=$("recipe-controls");if(!wrapper)return;
 const id=wrapper.dataset.id,base=Number(wrapper.dataset.base),input=$("recipe-servings"),rows=[...document.querySelectorAll(".ingredient-row")];
 const scale=()=>{const servings=validServings(input.value)||base;for(const row of rows)row.querySelector(".scaled-amount").textContent=fmt(Number(row.dataset.amount)*servings/base,row.dataset.unit)};
 input.addEventListener("input",scale);
 $("add-recipe-plan").addEventListener("click",()=>{const servings=validServings(input.value);if(servings===null){message("recipe-feedback","Enter 0.5–50 family servings.");return}state.plan.push({id:ID(),recipeId:id,servings,day:""});save();message("recipe-feedback","Added to meal planner on this device.")});
 $("copy-recipe").addEventListener("click",async()=>{const servings=validServings(input.value)||base,lines=[document.querySelector("h1").textContent,servings+" family servings","Ingredients:",...rows.map(row=>fmt(Number(row.dataset.amount)*servings/base,row.dataset.unit)+" "+row.dataset.name),"Instructions:",...[...document.querySelectorAll(".panel ol li")].map((n,j)=>(j+1)+". "+n.textContent)];try{await copy(lines.join("\n"));message("recipe-feedback","Scaled recipe copied for MacroFactor AI import.")}catch(_){message("recipe-feedback","Clipboard unavailable on this device.")}});
 const link=$("copy-link");if(link)link.addEventListener("click",async()=>{try{await copy(location.href);link.textContent="Copied!"}catch(_){link.textContent="Copy from address bar"}});
 scale();
}
function wire(){
 initIndex();initRecipe();
 if($("pantry-food")){
 setPantryOptions();$("pantry-add").addEventListener("click",addPantry);
 $("suggest-servings").addEventListener("change",renderSuggestions);
 $("export-backup").addEventListener("click",()=>download("family-recipes-private-backup.json",JSON.stringify(state,null,2)+"\n"));
 $("import-backup").addEventListener("change",async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{const candidate=safeState(JSON.parse(await f.text()));if(!candidate)throw Error("Invalid");if(!confirm("Replace all pantry items, meal plans and history on this device with the selected backup?"))return;state=candidate;save();renderPantry();renderSuggestions();renderPlan();renderShopping();message("pantry-status","Private backup imported.")}catch(_){message("pantry-status","Invalid backup file.")}finally{e.target.value=""}});
 renderPantry();renderSuggestions()
 }
 if($("plan-recipe")){
  const sel=$("plan-recipe");clear(sel);for(const r of recipes)option(sel,r.id,r.name);
  if(recipes.length)$("plan-servings").value=recipes[0].servings;
  sel.addEventListener("change",()=>{const r=recipeById.get(sel.value);if(r)$("plan-servings").value=r.servings});
  $("plan-add").addEventListener("click",()=>{const servings=validServings($("plan-servings").value),r=recipeById.get(sel.value);if(!r||servings===null){message("planner-status","Choose a recipe and a valid batch size.");return}state.plan.push({id:ID(),recipeId:r.id,servings,day:$("plan-day").value});save();renderPlan();renderShopping();message("planner-status","Added "+r.name)});
  $("copy-shopping").addEventListener("click",async()=>{try{await copy(textShopping());message("planner-status","Shopping list copied.")}catch(_){message("planner-status","Clipboard unavailable. Download CSV instead.")}});
  $("copy-anylist").addEventListener("click",async()=>{const items=shoppingRows();if(!items.length){message("planner-status","No groceries to transfer: add recipes first or check the pantry quantities.");return}try{await copy(anylistShopping());message("planner-status",items.length+" grocery items copied. Open your shared AnyList list, tap Add Item, then paste the items. Check the quantities before shopping.")}catch(_){message("planner-status","Clipboard unavailable on this device; use the CSV export instead.")}});
  $("download-shopping").addEventListener("click",()=>download("family-recipes-shopping.csv","\ufeff"+csvShopping(),"text/csv;charset=utf-8"));
  $("cook-first").addEventListener("click",cookFirst);renderPlan();renderShopping()
 }
}
async function start(){
 try{const res=await fetch(window.CB_CATALOG,{cache:"no-store"});if(!res.ok)throw Error("Catalog fetch failed");
 const data=await res.json();recipes=Array.isArray(data)?data.filter(r=>r&&r.id&&Array.isArray(r.ingredients)&&Number(r.servings)>0):[];
 recipeById=new Map(recipes.map(r=>[r.id,r]));buildFoods();
 }catch(_){message("pantry-status","Could not load recipe catalog; enable GitHub Pages and reload.");message("planner-status","Could not load recipe catalog.");}
 wire()
}
start();
})();