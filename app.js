"use strict";
const byId=id=>document.getElementById(id);
const key="zain-ai-studio-v01";
let scenes=[];
const templates=[
"مشهد افتتاحي: قدّم المكان والشخصية الأساسية ضمن بيئة عراقية واقعية، بحركة كاميرا بطيئة، وأصوات بيئة واضحة.",
"تصاعد الصراع: أظهر المشكلة عبر تصرفات الشخصيات وتعابير الوجوه، لقطة متوسطة مع تفاصيل صوتية طبيعية.",
"نقطة التحول: كشف معلومة تغيّر الأحداث، لقطات قريبة، وإيقاع عاطفي مؤثر.",
"الخاتمة: حل الصراع بمشهد إنساني واضح مع لقطة نهائية سينمائية."
];
function data(){return{title:byId("title").value,genre:byId("genre").value,count:Number(byId("count").value),duration:Number(byId("duration").value),dialect:byId("dialect").value,ratio:byId("ratio").value,idea:byId("idea").value,cast:byId("cast").value,scenes:[...scenes]};}
function prompt(i){const d=data();return [
"TITLE: "+d.title+" | SCENE "+(i+1)+"/"+scenes.length,
"FORMAT: cinematic photorealistic "+d.ratio+"; "+d.duration+" seconds.",
"STORY: "+d.idea,
"GENRE: "+d.genre,
"CONSISTENT CHARACTERS:\n"+d.cast,
"SCENE DIRECTION:\n"+scenes[i],
"CAMERA: Motivated smooth movement, realistic Iraqi setting and coherent lighting.",
"AUDIO: Authentic ambient sounds, prop effects and soft music lower than speech. Dialogue only in "+d.dialect+". Natural age-matched voices, clear pronunciation, separate speaking turns and accurate lip-sync. No invented dialogue.",
"QUALITY: Same character appearances throughout. Avoid visual distortions, subtitles, text overlays and watermarks."
].join("\n\n");}
function notice(t){byId("notice").textContent=t;}
function render(){const list=byId("sceneList");list.replaceChildren();scenes.forEach((s,i)=>{
const article=document.createElement("article");article.className="scene";
const h=document.createElement("h3");h.textContent="المشهد "+(i+1)+" — "+data().duration+" ثوانٍ";
const area=document.createElement("textarea");area.value=s;area.setAttribute("aria-label","المشهد "+(i+1));
const details=document.createElement("details");const summary=document.createElement("summary");summary.textContent="معاينة البرومبت الكامل";
const pre=document.createElement("pre");pre.textContent=prompt(i);
area.addEventListener("input",()=>{scenes[i]=area.value;pre.textContent=prompt(i);});
const btn=document.createElement("button");btn.className="secondary";btn.textContent="نسخ برومبت المشهد";
btn.addEventListener("click",()=>copyText(prompt(i)));
details.append(summary,pre);article.append(h,area,btn,details);list.append(article);
});byId("summary").textContent=scenes.length+" × "+data().duration+" = "+scenes.length*data().duration+" ثانية";}
function build(){if(!byId("idea").value.trim()){notice("أدخل فكرة القصة أولاً.");return;}const n=data().count;scenes=Array.from({length:n},(_,i)=>templates[i]||"طوّر أحداث القصة في هذا المشهد مع حوار عراقي ووصف دقيق للحركة والكاميرا والصوت.");render();notice("تم تجهيز قوالب المشاهد. عدّل كل مشهد قبل توليده.");}
function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(()=>notice("تم النسخ.")).catch(()=>notice("تعذر النسخ التلقائي، انسخ النص من المعاينة."));}else{notice("افتح معاينة البرومبت وانسخه يدوياً.");}}
function download(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function allPrompts(){return scenes.map((_,i)=>prompt(i)).join("\n\n"+"=".repeat(45)+"\n\n");}
function load(d){if(!d||typeof d!=="object"||!Array.isArray(d.scenes))throw Error("invalid");
for(const id of ["title","genre","count","duration","dialect","ratio","idea","cast"]){if(d[id]!=null&&byId(id)){const el=byId(id);if(el.tagName==="SELECT"){if([...el.options].some(x=>x.value===String(d[id])))el.value=String(d[id]);}else el.value=String(d[id]).slice(0,20000);}}
scenes=d.scenes.slice(0,8).map(x=>String(x).slice(0,15000));render();}
byId("build").addEventListener("click",build);
byId("reset").addEventListener("click",()=>{if(confirm("مسح المسودة الحالية؟")){scenes=[];render();notice("تم مسح المشاهد الحالية.");}});
byId("save").addEventListener("click",()=>{try{localStorage.setItem(key,JSON.stringify(data()));notice("تم الحفظ على هذا المتصفح. نزّل نسخة JSON للاحتياط.");}catch{notice("تعذر الحفظ. نزّل نسخة JSON.");}});
byId("copy").addEventListener("click",()=>copyText(allPrompts()));
byId("txt").addEventListener("click",()=>download("zain-prompts.txt",allPrompts(),"text/plain;charset=utf-8"));
byId("json").addEventListener("click",()=>download("zain-project.json",JSON.stringify(data(),null,2),"application/json"));
byId("upload").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>1e6)throw Error("too large");load(JSON.parse(await f.text()));notice("تم الاستيراد.");}catch{notice("الملف غير صالح أو كبير جداً.");}e.target.value="";});
byId("duration").addEventListener("change",render);
try{const saved=localStorage.getItem(key);if(saved)load(JSON.parse(saved));else build();}catch{build();}
