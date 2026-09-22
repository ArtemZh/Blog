
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const el=(tag,attrs,html)=>{const e=document.createElement(tag);if(attrs)for(const k in attrs){if(k==="cls")e.className=attrs[k];else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const money=v=>(v<0?"−":v>0?"+":"")+Math.abs(Math.round(v)).toLocaleString("uk-UA").replace(/\u00a0/g," ")+" $";
const money0=v=>Math.round(v).toLocaleString("uk-UA").replace(/\u00a0/g," ")+" $";
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const store={get(k,d){try{const v=localStorage.getItem("risk9_"+k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem("risk9_"+k,JSON.stringify(v));}catch(e){}}};

/* ================= ГЛОСАРІЙ + ПІДКАЗКИ ================= */
const GLOSS={
pmbok8:["PMBOK® Guide 8","Восьма редакція стандарту PMI (2025). Сім доменів продуктивності, серед них Risk Performance Domain, і шість процесів роботи з ризиками."],
risk:["Ризик (risk)","Невизначена подія або умова, яка, якщо станеться, позитивно чи негативно вплине на цілі проєкту."],
threat:["Загроза (threat)","Ризик з негативним впливом: затримка, перевитрата, шкода репутації."],
opportunity:["Можливість (opportunity)","Ризик з позитивним впливом: економія, швидший реліз, частка ринку."],
issue:["Проблема (issue)","Те, що вже сталося або відбувається. Живе в журналі проблем (issue log) і потребує дії зараз. Погано керований ризик часто стає проблемою."],
fig246:["Класифікація ризиків","PMBOK 8, Figure 2-46: Known–Known (факти), Known–Unknown (класичний ризик), Unknown–Known (прихований факт), Unknown–Unknown (емерджентний ризик)."],
ku:["Known–unknowns","Ризики, про які ми знаємо і можемо оцінити ймовірність та вплив. Під них — contingency reserve."],
uu:["Unknown–unknowns","Емерджентні ризики, які неможливо передбачити («чорні лебеді»). Під них — management reserve і стійкість проєкту."],
trigger:["Тригер","Спостережуваний, вимірюваний ранній сигнал, що подія ризику наближається або почалася. Запускає план реагування."],
owner:["Власник ризику","Одна конкретна людина, що стежить за тригерами і запускає план реагування. Не «команда»."],
rbs:["RBS","Risk Breakdown Structure — ієрархія категорій ризиків. Задається в плані управління ризиками й допомагає нічого не пропустити."],
appetite:["Апетит до ризику (risk appetite)","Скільки невизначеності організація чи людина готова прийняти в очікуванні вигоди."],
threshold:["Поріг ризику (risk threshold)","Кількісна межа допустимого відхилення від цілі. Напр., бюджет ±5% — нижчий апетит, ніж ±10%."],
exposure:["Експозиція (risk exposure)","Сукупний потенційний вплив усіх ризиків на певний момент. Часто — сума EMV відкритих ризиків."],
overall:["Загальний ризик проєкту","Вплив невизначеності на проєкт у цілому. Якщо він занадто високий, проєкт можуть закрити."],
resilience:["Стійкість (resilience)","Здатність проєкту поглинути удар і швидко відновитися. Головна мета домену ризиків у PMBOK 8."],
emv:["EMV","Expected Monetary Value = ймовірність × вплив у грошах. Для загроз — від'ємне, для можливостей — додатне."],
cr:["Contingency reserve","Резерв часу чи грошей під відомі ризики. Входить у cost baseline, ним розпоряджається PM."],
mr:["Management reserve","Резерв під непередбачене. Поза cost baseline, використання дозволяє керівництво."],
cb:["Cost baseline","Затверджений бюджет з розподілом у часі, без management reserve. Змінюється лише через управління змінами."],
secondary:["Вторинний ризик","Новий ризик, що виникає через саму дію з реагування. Напр., новий хостинг → ризик міграції."],
residual:["Залишковий ризик","Та частина ризику, що лишилася після реагування. Його приймають і, за потреби, резервують."],
premortem:["Premortem","Техніка Гері Кляйна: команда уявляє, що проєкт уже провалився, і пояснює чому. Знімає «оптимізм плану»."],
montecarlo:["Monte Carlo","Кількісна техніка: тисячі випадкових прогонів проєкту за оцінками задач дають розподіл строків чи вартості."],
roam:["ROAM","Resolved / Owned / Accepted / Mitigated — швидке сортування ризиків на PI Planning (SAFe)."],
burndown:["Risk burndown","Графік сумарної експозиції по спринтах. Має спадати."],
p80:["P80","Значення, яке не буде перевищено з імовірністю 80%. «З імовірністю 80% закінчимо за N тижнів»."]
};
const EXTRA_GL=[["Escalate","Ризик поза обсягом або повноваженнями PM — передаємо на рівень програми, портфеля, спонсора."],["Avoid","Усуваємо причину — ризик зникає. Для критичних загроз."],["Transfer","Передаємо наслідки третій стороні: страховка, SLA, fixed price. Ризик не зникає."],["Mitigate","Зменшуємо ймовірність і/або вплив загрози. Найчастіша стратегія."],["Accept","Приймаємо: активно (резерв + contingency plan) або пасивно (лише переглядаємо)."],["Exploit","Робимо так, щоб можливість точно реалізувалася."],["Share","Ділимося можливістю з партнером, який краще її використає."],["Enhance","Підвищуємо ймовірність і/або вигоду можливості."],["Шість процесів","Plan Risk Management → Identify Risks → Perform Risk Analysis → Plan Risk Responses → Implement Risk Responses → Monitor Risks."],["Формула ризику","Через <причину> може статися <подія>, що призведе до <ефекту на цілі>."]];

const pop=$("#pop");
function HINT(k,x,y){const g=GLOSS[k];if(!g)return;pop.innerHTML="<b>"+esc(g[0])+"</b><br>"+esc(g[1]);pop.style.display="block";
 const w=Math.min(320,window.innerWidth-20);let left=Math.min(x,window.innerWidth-w-12);pop.style.left=Math.max(8,left)+"px";pop.style.top=(y+14)+"px";}
document.addEventListener("click",e=>{const h=e.target.closest&&e.target.closest(".hn");if(h){HINT(h.dataset.k,e.pageX,e.pageY);e.stopPropagation();}else pop.style.display="none";});
const hn=(k,t)=>'<span class="hn" data-k="'+k+'">'+t+'</span>';

/* ================= НАВІГАЦІЯ / ПРОГРЕС ================= */
const done=store.get("done",{});
function markDone(id){if(!done[id]){done[id]=1;store.set("done",done);}renderToc();}
/* Навігація блоків — у хедері сайту (#appToc), видно лише на вкладці «Додаток». */
function renderToc(){const toc=$("#appToc");if(!toc)return;toc.innerHTML="";$$("#app section.blk").forEach((s,i)=>{const a=el("a",{href:"#"+s.id,cls:done[s.id]?"done":""},esc(s.dataset.t));a.dataset.s=s.id;a.dataset.n=done[s.id]?"✓":(i+1);toc.appendChild(a);});}
renderToc();
function spy(){if(document.body.dataset.tab!=="app")return;let cur=null;$$("#app section.blk").forEach(s=>{if(s.getBoundingClientRect().top<140)cur=s.id;});$$("#appToc a").forEach(a=>a.classList.toggle("on",a.dataset.s===cur));}
window.addEventListener("scroll",spy,{passive:true});

/* ================= РЕЄСТР: СТАН ================= */
const CATS=["Обсяг і вимоги","Люди і ресурси","Клієнт і комунікація","Технічні","Зовнішні"];
const STRAT_T=["—","Escalate","Avoid","Transfer","Mitigate","Accept","Mitigate + Transfer","Mitigate + Accept"];
const STRAT_O=["—","Escalate","Exploit","Share","Enhance","Accept"];
const STATUS=["Відкритий","Під наглядом","Спрацював","Закритий","Реалізується"];
const SAMPLE=[
{id:"R1",type:"t",title:"Через нову версію API платіжного провайдера стара може бути вимкнена до релізу, що зсуне запуск оплати на 2–3 тижні",cat:"Технічні",P:3,I:4,pct:40,cost:6000,owner:"Техлід",strat:"Mitigate",act:"Техлід у спринті 1 ізолює інтеграцію за адаптером і мігрує на нову версію API",trig:"Провайдер оголосив дату відключення",status:"Відкритий"},
{id:"R2",type:"t",title:"Через залежність від фіду постачальника імпорт каталогу може затриматися, що зсуне наповнення магазину на 1 тиждень",cat:"Зовнішні",P:4,I:2,pct:60,cost:2000,owner:"PM",strat:"Mitigate",act:"PM до кінця тижня отримує тестовий фід; готуємо ручний імпорт топ-100 товарів",trig:"Фід не отримано за 3 дні до дедлайну",status:"Під наглядом"},
{id:"R3",type:"t",title:"Через те, що дизайнер працює на двох проєктах, макети можуть надходити із запізненням, і фронтенд простоюватиме 2–3 дні",cat:"Люди і ресурси",P:3,I:2,pct:30,cost:1000,owner:"PM",strat:"Accept",act:"Закласти буфер 2 дні на спринт; фронтенд бере задачі з UI-кітом",trig:"Макет запізнюється більш ніж на 2 дні",status:"Відкритий"},
{id:"R4",type:"t",title:"Через пік трафіку в «чорну пʼятницю» сайт може не витримати навантаження, що призведе до втрати продажів і репутації",cat:"Технічні",P:2,I:5,pct:20,cost:15000,owner:"DevOps",strat:"Mitigate + Transfer",act:"QA до кінця спринту 3 проводить навантажувальний тест на 5× трафік; DevOps переносить на хостинг з автоскейлом і SLA",trig:"Час відповіді > 800 мс на тесті 3×",status:"Відкритий"},
{id:"O1",type:"o",title:"Завдяки готовому модулю доставки інтеграцію можна скоротити, і реліз відбудеться на 2 тижні раніше",cat:"Технічні",P:3,I:3,pct:50,cost:3000,owner:"Техлід",strat:"Enhance",act:"Техлід за 1 день до старту спринту перевіряє сумісність модуля",trig:"Перевірку сумісності пройдено",status:"Відкритий"}
];
let REG=store.get("reg",null)||JSON.parse(JSON.stringify(SAMPLE));
let TH=store.get("th",{t4:15,t3:8,t2:4});
const score=r=>r.P*r.I;
function zone(s){return s>=TH.t4?4:s>=TH.t3?3:s>=TH.t2?2:1;}
const ZN=["","Низький","Середній","Високий","Критичний"];
const emv=r=>(r.type==="o"?1:-1)*(r.pct/100)*r.cost;
function nextId(t){const p=t==="o"?"O":"R";let n=1;while(REG.some(r=>r.id===p+n))n++;return p+n;}
function issues(r){const out=[];const t=(r.title||"").trim();
 if(t.length<25)out.push("Опис закороткий: пишіть за формулою причина → подія → ефект");
 else if(!/(що призведе|призведе|що зсуне|через|завдяки|може)/i.test(t))out.push("Не видно формули «через … може … що призведе до …»");
 if(/^(нема|немає|відсутн)/i.test(t))out.push("Схоже на причину (факт), а не на ризик");
 if(/(вчора|сьогодні|вже сталося|впав)/i.test(t))out.push("Схоже на проблему (issue), а не на ризик");
 const o=(r.owner||"").trim().toLowerCase();
 if(!o)out.push("Немає власника");else if(/(команда|всі|усі|team)/.test(o))out.push("Власник — одна людина, не «команда»");
 if(r.type==="t"&&/(Exploit|Share|Enhance)/.test(r.strat))out.push("Exploit/Share/Enhance — стратегії для можливостей");
 if(r.type==="o"&&/(Avoid|Transfer|Mitigate)/.test(r.strat))out.push("Avoid/Transfer/Mitigate — стратегії для загроз");
 if(zone(score(r))>=3&&/Accept/.test(r.strat)&&!/Mitigate/.test(r.strat)&&r.type==="t")out.push("Високий ризик лише з Accept — чи є резерв і contingency plan?");
 if(r.strat&&r.strat!=="—"&&!(r.act||"").trim())out.push("Стратегія без конкретних дій");
 if(/^(стежити|контролювати|бути уважн|моніторити)/i.test((r.act||"").trim()))out.push("Дія розмита: хто, що саме, до коли?");
 if(r.strat&&r.strat!=="—"&&!(r.trig||"").trim())out.push("Немає тригера");
 if(/(щось піде не так|якщо буде погано|проблеми)$/i.test((r.trig||"").trim()))out.push("Тригер не вимірюваний");
 return out;}
const listeners=[];
function regChanged(src){store.set("reg",REG);listeners.forEach(f=>{if(f.src!==src)f.fn();});}
function onReg(src,fn){listeners.push({src,fn});}

/* ================= БЛОК 1 ================= */
const B1=[
["Платіжний провайдер може змінити API до релізу, і запуск оплати зсунеться","r","Невизначена подія з впливом на строки — класичний ризик."],
["Сервер продакшну впав сьогодні вранці","i","Вже сталося — це проблема, журнал проблем і дія зараз."],
["Магазин має приймати оплату карткою","f","Це вимога — частина обсягу, не ризик."],
["Мені якось неспокійно щодо цього проєкту","w","Немає причини, події, ефекту — тривога. Уточнюємо, що саме турбує."],
["Постачальник може запізнитися з фідом каталогу, що зсуне наповнення","r","Невизначено і впливає на строки — ризик."],
["Дизайнер уже тиждень на лікарняному","i","Вже відбувається — проблема. Ризик тут — що макети наступного спринту теж запізняться."],
["Готовий модуль доставки може скоротити інтеграцію на 2 тижні","r","Теж ризик — позитивний, тобто можливість."],
["Проєкт має бути зданий до 1 листопада","f","Це обмеження (constraint), відоме і визначене."],
["У команді немає QA","f","Це факт і ПРИЧИНА. Ризик — «через відсутність QA критичні дефекти можуть потрапити в прод»."],
["Раптом щось піде не так","w","Розмито, неможливо оцінити — тривога, не ризик."]];
const B1B=[["r","Ризик","невизначено, впливає на цілі"],["i","Проблема","вже сталося"],["f","Факт / вимога","точно є або буде"],["w","Тривога","неможливо описати й оцінити"]];
let b1sel=null,b1ok=0;
function b1init(){b1sel=null;b1ok=0;const pool=$("#b1pool");pool.innerHTML="";shuffle(B1.map((x,i)=>i)).forEach(i=>{const c=el("div",{cls:"chip"},esc(B1[i][0]));c.dataset.i=i;c.onclick=()=>{if(c.classList.contains("right"))return;$$("#b1pool .chip").forEach(x=>x.classList.remove("sel"));c.classList.add("sel");b1sel=c;$$(".bucket").forEach(b=>b.classList.add("hot"));};pool.appendChild(c);});
 const bb=$("#b1b");bb.innerHTML="";B1B.forEach(b=>{const d=el("div",{cls:"bucket"},"<h4>"+b[1]+"</h4><p>"+b[2]+"</p>");d.dataset.k=b[0];d.onclick=()=>b1drop(d);bb.appendChild(d);});
 $("#b1score").textContent="0 / 10";$("#b1fb").className="fb";}
function b1drop(d){if(!b1sel)return;const it=B1[+b1sel.dataset.i];const fb=$("#b1fb");$$(".bucket").forEach(b=>b.classList.remove("hot"));
 if(it[1]===d.dataset.k){const c=el("div",{cls:"chip right"},esc(it[0]));d.appendChild(c);b1sel.remove();b1ok++;fb.className="fb ok";fb.innerHTML="✓ "+esc(it[2]);}
 else{b1sel.classList.add("wrong");fb.className="fb bad";fb.innerHTML="✕ Не зовсім. Підказка: "+esc(it[2].split(" — ")[0])+"… спробуйте інший кошик.";setTimeout(()=>{$$("#b1pool .chip").forEach(x=>x.classList.remove("wrong"));},900);b1sel.classList.remove("sel");}
 b1sel=null;$("#b1score").textContent=b1ok+" / 10";if(b1ok===10){fb.className="fb ok";fb.innerHTML="🎉 Усі 10 на місці. Зверніть увагу на «У команді немає QA»: найчастіша помилка новачка — записати причину замість ризику.";markDone("b1");}}
$("#b1reset").onclick=b1init;b1init();

/* ================= БЛОК 2 ================= */
const AN={c:[["Провайдер оголосив нову версію API",0],["Дизайнер працює на двох проєктах",1],["Навантаження ніколи не тестували",2],["Команда вперше працює з цим модулем",3]],
e:[["стара версія API може бути вимкнена до релізу",0],["макети можуть надходити із запізненням",1],["сайт може впасти в пік продажів",2],["інтеграція може зайняти вдвічі менше часу",3]],
f:[["запуск оплати зсунеться на 2–3 тижні",0],["фронтенд простоюватиме 2–3 дні на спринт",1],["магазин втратить продажі й репутацію",2],["реліз відбудеться на 2 тижні раніше",3]],
g:[["провайдер надіслав лист про депрекацію",0],["макет запізнюється більш ніж на 2 дні",1],["час відповіді > 800 мс на тесті 3×",2],["перевірку сумісності пройдено за 1 день",3]]};
const ANH={c:["Причина","вже існує"],e:["Подія","невизначена"],f:["Ефект","вплив на цілі"],g:["Тригер","ранній сигнал"]};
let b2s={};
function b2init(){b2s={};const cols=$("#b2cols");cols.innerHTML="";["c","e","f","g"].forEach(k=>{const col=el("div",{cls:"col"},"<h4>"+ANH[k][0]+' <small class="q">· '+ANH[k][1]+"</small></h4>");shuffle(AN[k]).forEach(o=>{const b=el("button",{cls:"opt"},esc(o[0]));b.onclick=()=>{col.querySelectorAll(".opt").forEach(x=>x.classList.remove("on"));b.classList.add("on");b2s[k]=o;b2render();};col.appendChild(b);});cols.appendChild(col);});b2render();}
function b2render(){const f=$("#b2f"),fb=$("#b2fb");const p=k=>b2s[k]?'<span class="'+k+'">'+esc(b2s[k][0])+"</span>":'<span style="color:#aab">…</span>';
 const opp=b2s.e&&b2s.e[1]===3;
 f.innerHTML=(opp?"<b>Завдяки тому, що</b> ":"<b>Через те, що</b> ")+p("c")+", "+p("e")+", <b>що призведе до того, що</b> "+p("f")+"."+'<div style="margin-top:6px;font-size:.88rem"><b>Тригер:</b> '+p("g")+"</div>";
 f.innerHTML=f.innerHTML.replace("<b>Через те, що</b> ","<b>Через те, що</b> ").replace(/, <span class="e">/,', <span class="e">');
 const ks=Object.keys(b2s);$("#b2add").disabled=ks.length<3;
 if(ks.length<4){fb.className="fb";return;}
 const ids=ks.map(k=>b2s[k][1]);
 if(ids.every(x=>x===ids[0])){fb.className="fb ok";fb.innerHTML="✓ Коректний "+(ids[0]===3?"позитивний ризик (можливість)":"ризик")+": причина породжує подію, подія — ефект, а тригер сигналізує саме про цю подію.";markDone("b2");}
 else{const bad=[];if(b2s.c[1]!==b2s.e[1])bad.push("причина не породжує цю подію");if(b2s.e[1]!==b2s.f[1])bad.push("ефект не випливає з події");if(b2s.g[1]!==b2s.e[1])bad.push("тригер сигналізує про іншу подію");fb.className="fb bad";fb.innerHTML="✕ Ланцюжок розірваний: "+bad.join("; ")+".";}}
$("#b2rand").onclick=b2init;
$("#b2add").onclick=()=>{const opp=b2s.e[1]===3;const r={id:nextId(opp?"o":"t"),type:opp?"o":"t",title:(opp?"Завдяки тому, що ":"Через те, що ")+b2s.c[0].toLowerCase()+", "+b2s.e[0]+", що призведе до того, що "+(b2s.f?b2s.f[0]:"…"),cat:"Технічні",P:3,I:3,pct:30,cost:2000,owner:"",strat:"—",act:"",trig:b2s.g?b2s.g[0]:"",status:"Відкритий"};REG.push(r);regChanged();$("#b2fb").className="fb ok";$("#b2fb").innerHTML="Додано в реєстр як "+r.id+". Відкрийте блок 10, щоб доповнити власника й стратегію.";};
b2init();
const BW=[["«Проблеми з оплатою»","Немає причини, події й ефекту.","Через те, що провайдер оголосив нову версію API, стара може бути вимкнена до релізу, що зсуне запуск оплати на 2–3 тижні."],
["«Нема тестувальника»","Це причина, факт — не ризик.","Через відсутність QA критичні дефекти можуть потрапити в прод, що призведе до втрати замовлень у перший тиждень."],
["«Можливі затримки»","Розмито, неможливо оцінити.","Через залежність від фіду постачальника імпорт товарів може затриматися, що зсуне наповнення на 1 тиждень."],
["«Клієнт може бути незадоволений»","Ефект без причини і події.","Через те, що клієнт не бачив прототип кошика, він може не прийняти UX на демо, що додасть 1 спринт переробок."]];
BW.forEach(b=>{const d=el("div",{cls:"bwi"},'<b style="color:var(--c-clay)">✕ '+esc(b[0])+'</b><div class="q" style="margin:2px 0">'+esc(b[1])+'</div><div class="good">✓ '+esc(b[2])+'</div><small class="q">клікніть, щоб побачити краще</small>');d.onclick=()=>d.classList.toggle("open");$("#b2bw").appendChild(d);});
const UQ=[["Магазин має приймати оплату карткою","kk"],["Провайдер може змінити API (є історія таких змін)","ku"],["Нова вимога податкової, про яку команда не чула, але юристи знають","uk"],["Глобальний збій хмарного провайдера, якого ніхто не прогнозував","uu"],["Постачальник двічі запізнювався з фідом — може знову","ku"],["Бібліотека має відому вразливість, описану на форумах, але команда не читала","uk"]];
const UQD=[["kk","Known–Known","факти й вимоги → не ризик, частина обсягу"],["ku","Known–Unknown","класичний ризик → оцінюємо, contingency"],["uk","Unknown–Known","прихований факт → питати експертів"],["uu","Unknown–Unknown","емерджентний → management reserve, стійкість"]];
let uSel=null,uOk=0;
(function(){const pool=$("#b2upool");shuffle(UQ).forEach(u=>{const c=el("div",{cls:"chip"},esc(u[0]));c.dataset.k=u[1];c.onclick=()=>{if(c.classList.contains("right"))return;$$("#b2upool .chip").forEach(x=>x.classList.remove("sel"));c.classList.add("sel");uSel=c;$$(".qd").forEach(q=>q.classList.add("hot"));};pool.appendChild(c);});
 UQD.forEach(q=>{const d=el("div",{cls:"qd"},"<h4>"+q[1]+"</h4><small>"+q[2]+"</small>");d.onclick=()=>{if(!uSel)return;const fb=$("#b2ufb");$$(".qd").forEach(x=>x.classList.remove("hot"));
  if(uSel.dataset.k===q[0]){const c=el("div",{cls:"chip right",style:"margin-top:6px;font-size:.8rem"},uSel.innerHTML);d.appendChild(c);uSel.remove();uOk++;fb.className="fb ok";fb.innerHTML="✓ Так. "+(uOk===6?"Усі на місці. Робота PM — переводити «unknown–known» у «known–unknown»: питати експертів, читати регуляції, вивчати lessons learned.":"");}
  else{fb.className="fb bad";fb.innerHTML="✕ Подумайте: чи знає про це хтось у світі? Чи можемо ми оцінити ймовірність?";uSel.classList.remove("sel");}uSel=null;};$("#b2quad").appendChild(d);});})();

/* ================= БЛОК 3 ================= */
const PR=[
{n:"Plan Risk Management",u:"План управління ризиками",ph:"Ініціація / початок планування",goal:"Визначити, як працюватимемо з ризиками: глибина, ролі, шкали, резерви, частота переглядів.",in:"Статут проєкту, план управління проєктом, реєстр стейкхолдерів, фактори середовища, активи організації",tt:"Експертна думка, інтервʼю, аналіз стейкхолдерів, зустрічі",out:"План управління ризиками (частина плану проєкту)",pm:"Який апетит у спонсора? Що для нас «високий вплив»? Хто розпоряджається резервом?",shop:"1,5 сторінки в Confluence: шкали 1–5, щотижневий огляд на статус-мітингу, contingency ≈ сума EMV."},
{n:"Identify Risks",u:"Ідентифікація",ph:"Планування, далі — постійно",goal:"Знайти загрози й можливості та відділити справжні ризики від тривог і проблем. Ітеративно.",in:"План управління ризиками, вимоги, оцінки, припущення, договори",tt:"Мозковий штурм, інтервʼю, чек-листи, аналіз припущень, root cause, SWOT, prompt lists, premortem",out:"Реєстр ризиків (v1), risk report",pm:"Які припущення ми зробили? Що пішло не так на схожих проєктах?",shop:"Premortem на 45 хв після затвердження плану дав 14 ідей → 6 ризиків у реєстр."},
{n:"Perform Risk Analysis",u:"Аналіз (якісний + кількісний)",ph:"Планування, далі — постійно",goal:"Оцінити ризики за ймовірністю і впливом; за потреби — кількісно оцінити сукупний вплив на цілі.",in:"Реєстр ризиків, план управління ризиками, оцінки строків і вартості",tt:"Матриця P×I, EMV, дерево рішень, Monte Carlo, аналіз чутливості",out:"Оновлений реєстр (v2): score, пріоритет, EMV",pm:"Які ризики близькі в часі? Чи є спільні причини? Чи потрібен кількісний аналіз узагалі?",shop:"Якісна матриця для всіх, EMV — для 4 ризиків з грошовим впливом, Monte Carlo — для строку."},
{n:"Plan Risk Responses",u:"Планування реагування",ph:"Планування і виконання",goal:"Обрати стратегії та конкретні дії для окремих ризиків і для загального ризику проєкту.",in:"Реєстр ризиків, risk report, резерви, ресурси",tt:"10 стратегій, аналіз альтернатив, аналіз вартості/вигоди",out:"Реєстр (v3): власник, стратегія, дії, тригер; change requests",pm:"Чи дешевше реагування за EMV? Чи в моїх повноваженнях це рішення?",shop:"R4 → Mitigate + Transfer (тест 5× і хостинг з SLA); R3 → активне Accept з буфером."},
{n:"Implement Risk Responses",u:"Виконання реагування",ph:"Виконання",goal:"Реально виконати заплановані дії. Найчастіше «забутий» процес.",in:"План управління ризиками, реєстр, lessons learned",tt:"Експертна думка, інформаційні системи (Jira-задачі на дії з реагування)",out:"Change requests, оновлений реєстр, issue log",pm:"Дії з реагування — у беклозі поряд із фічами? Хто і коли їх виконує?",shop:"Задача «Навантажувальний тест 5×» у спринті 3 з виконавцем QA."},
{n:"Monitor Risks",u:"Моніторинг",ph:"Моніторинг і контроль, до закриття",goal:"Стежити за тригерами, переоцінювати, шукати нові ризики, оцінювати ефективність реагування.",in:"Реєстр, дані про виконання, звіти",tt:"Аналіз резервів, технічний аналіз, аудит ризиків, огляди на зустрічах, risk burndown",out:"Реєстр (v4): статуси, тренд; lessons learned",pm:"Коли реєстр востаннє змінювався? Експозиція росте чи падає?",shop:"15 хвилин на статус-мітингу: топ-5 ризиків, нові з ретро, що спрацювало."}];
let b3cur=0,b3seq=[];
function b3render(){const ch=$("#b3chain");ch.innerHTML="";PR.forEach((p,i)=>{const d=el("div",{cls:"pstep"+(i===b3cur?" on":"")},'<span class="n">ПРОЦЕС '+(i+1)+"</span><b>"+p.n+"</b><small>"+p.u+"</small>");d.onclick=()=>{b3cur=i;b3render();};ch.appendChild(d);});
 const p=PR[b3cur];$("#b3det").innerHTML="<h3 style='margin-top:0'>"+(b3cur+1)+". "+p.n+" <small class='q'>· "+p.ph+"</small></h3><dl><dt>Навіщо</dt><dd>"+p.goal+"</dd><dt>Вхід</dt><dd>"+p.in+"</dd><dt>Техніки</dt><dd>"+p.tt+"</dd><dt>Вихід</dt><dd>"+p.out+"</dd><dt>Питання PM</dt><dd>"+p.pm+"</dd><dt>В інтернет-магазині</dt><dd>"+p.shop+"</dd></dl>";}
function b3ord(){const o=$("#b3ord");o.innerHTML="";shuffle(PR.map((p,i)=>i)).forEach(i=>{const c=el("div",{cls:"chip"},PR[i].n);c.onclick=()=>{if(c.classList.contains("right"))return;b3seq.push(i);c.classList.add("right");b3check();};o.appendChild(c);});b3seq=[];b3check();}
function b3check(){$("#b3seq").textContent="Ваша послідовність: "+(b3seq.length?b3seq.map(i=>i+1+"").join(" → "):"—");const fb=$("#b3fb");
 if(b3seq.length<6){fb.className="fb";return;}const ok=b3seq.every((v,i)=>v===i);
 if(ok){fb.className="fb ok";fb.innerHTML="✓ Правильно. Але памʼятайте: після першого проходу Identify, Analyze, Plan Responses і Monitor повторюються циклічно до закриття проєкту.";markDone("b3");}
 else{fb.className="fb bad";fb.innerHTML="✕ Не зовсім. Логіка: спершу домовляємося ЯК (план), потім ЩО (ідентифікація), НАСКІЛЬКИ (аналіз), ЩО РОБИТИ (реагування), РОБИМО, СТЕЖИМО.";}}
$("#b3r").onclick=b3ord;b3render();b3ord();

/* ================= БЛОК 4 ================= */
const RBS=[
["Обсяг і вимоги","Що ми будуємо і чи однаково це розуміємо",[["Через нечіткі критерії приймання клієнт може не прийняти кошик на демо, що додасть спринт переробок","Хто і як приймає кожну фічу?"],["Через нові ідеї клієнта посеред розробки обсяг може розростатися (scope creep), що зсуне реліз","Як ми обробляємо нові запити?"],["Через зміну пріоритетів маркетингу фічі можуть переставлятися, що зламає план інтеграцій","Хто остаточно затверджує пріоритети?"]]],
["Люди і ресурси","Хто робить і чи вистачить рук",[["Через те, що лише один розробник знає інтеграцію оплати (bus factor), його відсутність може зупинити роботу","Скільки людей знає кожну критичну частину?"],["Через паралельні проєкти команда може бути перевантажена, що знизить швидкість на 30%","Яка реальна алокація людей?"],["Через відпустку техліда в сезон рішення можуть затримуватися","Чий календар ми не перевірили?"]]],
["Клієнт і комунікація","Як швидко ми отримуємо рішення",[["Через завантаженість клієнта погодження макетів можуть займати тиждень замість 2 днів","Який SLA на відповіді клієнта?"],["Через те, що контент (фото, описи) готує клієнт, наповнення може затриматися","Хто відповідає за контент і до коли?"],["Через конфлікт пріоритетів між маркетингом і продажами у клієнта вимоги можуть суперечити одна одній","Хто в клієнта має останнє слово?"]]],
["Технічні","З чим ми працюємо і що може зламатися",[["Через нову версію API провайдера стара може бути вимкнена до релізу","Які зовнішні API і які в них плани?"],["Через пік трафіку в «чорну пʼятницю» сайт може не витримати навантаження","Яке очікуване навантаження і чи тестували ми його?"],["Завдяки готовому модулю доставки інтеграцію можна скоротити на 2 тижні (можливість)","Чи є готові рішення, які зекономлять час?"]]],
["Зовнішні","Регуляції, постачальники, ринок",[["Через зміни податкових правил для e-commerce може знадобитися доробка фіскалізації","Які регуляції діють і змінюються?"],["Через залежність від фіду постачальника імпорт каталогу може затриматися","Від яких постачальників ми залежимо?"],["Через коливання курсу валют закупівля ліцензій може подорожчати на 10%","У якій валюті наші витрати?"]]]];
let b4c=0;
function b4render(){const c=$("#b4cats");c.innerHTML="";RBS.forEach((r,i)=>{const b=el("button",{cls:"rcat"+(i===b4c?" on":"")},"<b>"+r[0]+"</b><br><small>"+r[1]+"</small>");b.onclick=()=>{b4c=i;b4render();};c.appendChild(b);});
 const l=$("#b4list");const r=RBS[b4c];l.innerHTML="<b>"+r[0]+"</b> <small class='q'>· PESTLE / TECOP допоможуть розширити список</small>";
 r[2].forEach(x=>{const d=el("div",{cls:"ritem"},"<div>"+esc(x[0])+"<br><small class='q'>❓ "+esc(x[1])+"</small></div>");const b=el("button",{cls:"btn sm"},"+ в реєстр");
  b.onclick=()=>{const opp=/можливість/.test(x[0]);REG.push({id:nextId(opp?"o":"t"),type:opp?"o":"t",title:x[0].replace(" (можливість)",""),cat:r[0],P:3,I:3,pct:30,cost:2000,owner:"",strat:"—",act:"",trig:"",status:"Відкритий"});regChanged();b.textContent="✓ додано";b.disabled=true;markDone("b4");};d.appendChild(b);l.appendChild(d);});}
b4render();
/* premortem */
const PMS=[["Налаштування",0,"Ведучий: «Минуло пів року. Проєкт інтернет-магазину — повний провал». Переконайтеся, що всі знають план."],["Тихе письмо",300,"5 хвилин кожен САМ пише причини провалу. Без обговорення — так уникаємо групового тиску."],["По колу",0,"Кожен називає по одній причині, доки список не вичерпається. Записуйте нижче."],["Групування",0,"Обʼєднайте схожі причини і переформулюйте в ризики за формулою."],["Топ і дії",0,"Кожен має 3 голоси. Для топ-3 — власник і перша дія."]];
let pmStep=0,pmItems=[],pmTimer=null,pmLeft=300,pmVotes=9;
const PM_SUG=["Платіжна інтеграція не була готова до сезону","Сайт ліг у чорну пʼятницю","Клієнт тижнями не погоджував макети","Каталог так і не наповнили вчасно","Техлід пішов у відпустку в найгарячіший момент","Клієнт на демо сказав, що хотів зовсім інше"];
function pmRender(){const st=$("#b4st");st.innerHTML="";PMS.forEach((s,i)=>{st.appendChild(el("div",{cls:"pm-st"+(i===pmStep?" on":i<pmStep?" dn":"")},"<b>"+(i+1)+"</b><br>"+s[0]));});
 const b=$("#b4pm");const s=PMS[pmStep];let h="<b>"+(pmStep+1)+". "+s[0]+"</b><p class='q'>"+s[2]+"</p>";
 if(pmStep===1)h+="<div class='row'><span class='timer' id='pmT'>"+fmtT(pmLeft)+"</span><button class='btn sm' id='pmGo'>"+(pmTimer?"⏸ Пауза":"▶ Старт")+"</button><button class='btn sm' id='pmSk'>Пропустити таймер</button></div>";
 if(pmStep===2||pmStep===3){h+="<div class='row'><input type='text' id='pmIn' style='flex:1' placeholder='Причина провалу…'><button class='btn sm' id='pmAdd'>Додати</button><button class='btn sm' id='pmSug'>Підкинути приклад</button></div><div id='pmL'></div>";}
 if(pmStep===4){h+="<div class='q'>Голосів лишилось: <b id='pmV'>"+pmVotes+"</b></div><div class='votes' id='pmL'></div>";}
 h+="<div class='row' style='margin-top:10px'>"+(pmStep>0?"<button class='btn sm' id='pmBack'>← Назад</button>":"")+(pmStep<4?"<button class='btn pri sm' id='pmNext'>Далі →</button>":"<button class='btn pri sm' id='pmExp'>Відправити топ-3 у реєстр</button>")+"</div>";
 b.innerHTML=h;
 if($("#pmGo"))$("#pmGo").onclick=()=>{if(pmTimer){clearInterval(pmTimer);pmTimer=null;}else{pmTimer=setInterval(()=>{pmLeft--;const t=$("#pmT");if(t)t.textContent=fmtT(pmLeft);if(pmLeft<=0){clearInterval(pmTimer);pmTimer=null;pmStep=2;pmRender();}},1000);}pmRender();};
 if($("#pmSk"))$("#pmSk").onclick=()=>{clearInterval(pmTimer);pmTimer=null;pmStep=2;pmRender();};
 if($("#pmAdd")){const add=v=>{v=(v||"").trim();if(!v)return;pmItems.push({t:v,v:0,edit:false});pmRender();};$("#pmAdd").onclick=()=>add($("#pmIn").value);$("#pmIn").onkeydown=e=>{if(e.key==="Enter")add(e.target.value);};$("#pmSug").onclick=()=>{const left=PM_SUG.filter(x=>!pmItems.some(p=>p.t===x));if(left.length)add(left[0]);};}
 const L=$("#pmL");if(L){if(!pmItems.length)L.innerHTML="<div class='q'>Поки порожньо.</div>";pmItems.forEach((p,i)=>{const d=el("div",{cls:"ritem"});
  if(pmStep===3){d.innerHTML="<div style='flex:1'><small class='q'>Було: "+esc(p.t)+"</small><input type='text' style='width:100%' value='"+esc(p.r||("Через … може статися: "+p.t.toLowerCase()+", що призведе до …"))+"'></div>";d.querySelector("input").oninput=e=>{p.r=e.target.value;};const x=el("button",{cls:"btn sm"},"✕");x.onclick=()=>{pmItems.splice(i,1);pmRender();};d.appendChild(x);}
  else if(pmStep===4){d.innerHTML="<div style='flex:1'>"+esc(p.r||p.t)+"</div><b style='min-width:40px;text-align:right'>"+("●".repeat(p.v)||"—")+"</b>";const m=el("button",{cls:"btn sm"},"−");m.onclick=()=>{if(p.v>0){p.v--;pmVotes++;pmRender();}};const pl=el("button",{cls:"btn sm"},"+ голос");pl.onclick=()=>{if(pmVotes>0){p.v++;pmVotes--;pmRender();}};d.appendChild(m);d.appendChild(pl);}
  else{d.innerHTML="<div>"+(i+1)+". "+esc(p.t)+"</div>";const x=el("button",{cls:"btn sm"},"✕");x.onclick=()=>{pmItems.splice(i,1);pmRender();};d.appendChild(x);}
  L.appendChild(d);});}
 if($("#pmBack"))$("#pmBack").onclick=()=>{pmStep--;pmRender();};
 if($("#pmNext"))$("#pmNext").onclick=()=>{if(pmStep===1&&pmTimer){clearInterval(pmTimer);pmTimer=null;}pmStep++;pmRender();};
 if($("#pmExp"))$("#pmExp").onclick=()=>{const top=pmItems.slice().sort((a,b)=>b.v-a.v).filter(x=>x.v>0).slice(0,3);if(!top.length){$("#pmExp").textContent="Спершу проголосуйте";return;}top.forEach(t=>REG.push({id:nextId("t"),type:"t",title:t.r||t.t,cat:"Обсяг і вимоги",P:3,I:4,pct:40,cost:3000,owner:"",strat:"—",act:"",trig:"",status:"Відкритий"}));regChanged();markDone("b4");$("#pmExp").textContent="✓ "+top.length+" ризики в реєстрі";$("#pmExp").disabled=true;};}
function fmtT(s){return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
pmRender();

/* ================= БЛОК 5 ================= */
let b5sel=null;
function cellClass(s){return "c"+zone(s);}
function b5render(){const mx=$("#b5mx");mx.innerHTML="";
 for(let p=5;p>=1;p--){mx.appendChild(el("div",{cls:"ax"},p));for(let i=1;i<=5;i++){const c=el("div",{cls:"cell "+cellClass(p*i)},'<span class="sc">'+p*i+"</span>");c.onclick=()=>{if(b5sel){const r=REG.find(x=>x.id===b5sel);if(r){r.P=p;r.I=i;regChanged("b5");b5render();}}};
  REG.filter(r=>r.P===p&&r.I===i&&r.status!=="Закритий").forEach(r=>{const d=el("span",{cls:"dot"+(r.type==="o"?" o":"")+(r.id===b5sel?" s":""),title:r.title,draggable:"true"},r.id);d.onclick=e=>{e.stopPropagation();b5sel=b5sel===r.id?null:r.id;b5render();};d.ondragstart=e=>{b5sel=r.id;try{e.dataTransfer.setData("text",r.id);}catch(_){}};c.appendChild(d);});
  c.ondragover=e=>e.preventDefault();c.ondrop=e=>{e.preventDefault();const r=REG.find(x=>x.id===b5sel);if(r){r.P=p;r.I=i;regChanged("b5");b5render();}};
  mx.appendChild(c);}}
 mx.appendChild(el("div",{cls:"ax"},""));for(let i=1;i<=5;i++)mx.appendChild(el("div",{cls:"ax"},i));
 ["t4","t3","t2"].forEach(k=>{$("#"+k).value=TH[k];$("#"+k+"v").textContent=TH[k];});
 const cnt=[0,0,0,0,0];REG.filter(r=>r.status!=="Закритий").forEach(r=>cnt[zone(score(r))]++);
 $("#b5cnt").innerHTML=[4,3,2,1].map(z=>'<span class="pill z'+z+'" style="margin:2px">'+ZN[z]+": "+cnt[z]+"</span>").join(" ");
 const r=REG.find(x=>x.id===b5sel);const s=$("#b5sel");
 if(!r){s.innerHTML="Оберіть ризик на матриці (клік по мітці), потім клікніть клітинку, щоб змінити оцінку. Можна й перетягнути.";return;}
 const sc=score(r),z=zone(sc);
 const adv={4:"Реагування одразу, контроль спонсора. Mitigate / Avoid / Escalate.",3:"Активна стратегія, власник і тригер обовʼязкові.",2:"Mitigate або активне прийняття з резервом.",1:"Прийняти, переглядати періодично."}[z];
 s.innerHTML="<b>"+r.id+"</b> "+(r.type==="o"?'<span class="pill opp">можливість</span>':"")+"<div style='margin:4px 0'>"+esc(r.title)+"</div>P = "+r.P+" · I = "+r.I+" · score = <b>"+sc+'</b> <span class="pill z'+z+'">'+ZN[z]+"</span><div class='q' style='margin-top:6px'>"+(r.type==="o"?"Для можливості висока зона означає: варто активно Exploit / Enhance.":adv)+"</div>";}
["t4","t3","t2"].forEach(k=>{$("#"+k).oninput=e=>{TH[k]=+e.target.value;if(TH.t3>=TH.t4)TH.t3=TH.t4-1;if(TH.t2>=TH.t3)TH.t2=TH.t3-1;if(TH.t2<2)TH.t2=2;store.set("th",TH);b5render();regChanged("b5");markDone("b5");};});
$$("[data-ap]").forEach(b=>b.onclick=()=>{TH={low:{t4:10,t3:5,t2:3},std:{t4:15,t3:8,t2:4},high:{t4:20,t3:12,t2:6}}[b.dataset.ap];store.set("th",TH);b5render();regChanged("b5");});
onReg("b5",b5render);b5render();
function scRender(){const P=+$("#scP").value,D=+$("#scD").value,B=+$("#scB").value,Q=+$("#scQ").value;$("#scPv").textContent=P+"%";$("#scDv").textContent=D;$("#scBv").textContent=B+"%";
 const ps=P<10?1:P<30?2:P<50?3:P<70?4:5;const ds=D<2?1:D<=5?2:D<=14?3:D<=30?4:5;const bs=B<1?1:B<3?2:B<7?3:B<15?4:5;const I=Math.max(ds,bs,Q);const worst=I===ds?"строки":I===bs?"бюджет":"обсяг/якість";const s=ps*I,z=zone(s);
 const bar=(l,v,hl)=>"<div style='display:flex;align-items:center;gap:8px;margin:4px 0'><span style='width:130px;font-size:.85rem'>"+l+"</span><div class='meter' style='flex:1'><i style='width:"+v*20+"%;background:"+(hl?"var(--red)":"var(--blue)")+"'></i></div><b>"+v+"</b></div>";
 $("#scOut").innerHTML="<b>Бали</b>"+bar("Ймовірність",ps)+bar("Вплив: строки",ds,I===ds)+bar("Вплив: бюджет",bs,I===bs&&I!==ds)+bar("Вплив: обсяг",Q,I===Q&&I!==ds&&I!==bs)+"<div style='margin-top:8px'>I = max = <b>"+I+"</b> (найгірше — "+worst+")</div><div style='font-size:1.3rem;margin-top:4px'>Score = "+ps+" × "+I+" = <b>"+s+'</b> <span class="pill z'+z+'">'+ZN[z]+"</span></div>";}
["scP","scD","scB","scQ"].forEach(k=>$("#"+k).oninput=scRender);scRender();

/* ================= БЛОК 6 ================= */
function b6render(){const t=$("#b6t");const rows=REG.filter(r=>r.status!=="Закритий");
 let h="<tr><th>ID</th><th>Ризик</th><th>Тип</th><th>P, %</th><th>Вплив, $</th><th>EMV</th></tr>";
 rows.forEach(r=>{h+="<tr><td><b>"+r.id+"</b></td><td>"+esc(r.title.length>80?r.title.slice(0,78)+"…":r.title)+"</td><td>"+(r.type==="o"?'<span class="pill opp">+</span>':'<span class="pill z4">−</span>')+"</td><td><input type='number' class='n' min='0' max='100' step='5' value='"+r.pct+"' data-id='"+r.id+"' data-f='pct'></td><td><input type='number' class='n' style='width:90px' min='0' step='500' value='"+r.cost+"' data-id='"+r.id+"' data-f='cost'></td><td><b style='color:"+(emv(r)<0?"var(--c-clay)":"var(--c-green)")+"'>"+money(emv(r))+"</b></td></tr>";});
 const thr=rows.filter(r=>r.type==="t").reduce((a,r)=>a+emv(r),0),opp=rows.filter(r=>r.type==="o").reduce((a,r)=>a+emv(r),0);
 h+="<tr><td></td><td><b>Разом (exposure)</b></td><td></td><td></td><td></td><td><b>"+money(thr+opp)+"</b></td></tr>";t.innerHTML=h;
 t.querySelectorAll("input").forEach(i=>i.onchange=e=>{const r=REG.find(x=>x.id===e.target.dataset.id);r[e.target.dataset.f]=Math.max(0,+e.target.value||0);if(r.pct>100)r.pct=100;regChanged("b6");b6render();markDone("b6");});
 const base=+$("#b6base").value||0,mrp=+$("#b6mr").value;$("#b6mrv").textContent=mrp+"%";
 const cont=Math.max(0,-(thr+($("#b6opp").checked?opp:0)));const mr=base*mrp/100;
 $("#b6k").innerHTML=[["Загрози, EMV",money(thr)],["Можливості, EMV",money(opp)],["Contingency reserve",money0(cont)],["Management reserve",money0(mr)]].map(k=>"<div class='kpi'><div class='v'>"+k[1]+"</div><div class='l'>"+k[0]+"</div></div>").join("");
 const tot=base+cont+mr||1;const W=380,x0=20;const w1=base/tot*W,w2=cont/tot*W,w3=mr/tot*W;
 $("#b6bar").innerHTML='<text x="20" y="18" font-size="13" font-weight="700" fill="var(--ink)">Структура бюджету: '+money0(tot)+'</text>'+
 '<rect x="'+x0+'" y="36" width="'+w1+'" height="36" fill="var(--act)"/><rect x="'+(x0+w1)+'" y="36" width="'+w2+'" height="36" fill="var(--c-gold)"/><rect x="'+(x0+w1+w2)+'" y="36" width="'+w3+'" height="36" fill="var(--c-purple)"/>'+
 '<line x1="'+(x0+w1+w2)+'" y1="28" x2="'+(x0+w1+w2)+'" y2="82" stroke="var(--ink)" stroke-dasharray="4 3"/><text x="'+(x0+w1+w2)+'" y="96" font-size="10" text-anchor="end" fill="var(--ink)">межа cost baseline</text>'+
 '<rect x="20" y="112" width="12" height="12" fill="var(--act)"/><text x="38" y="122" font-size="12" fill="var(--ink)">Роботи '+money0(base)+'</text>'+
 '<rect x="20" y="132" width="12" height="12" fill="var(--c-gold)"/><text x="38" y="142" font-size="12" fill="var(--ink)">Contingency '+money0(cont)+' (у baseline)</text>'+
 '<rect x="20" y="152" width="12" height="12" fill="var(--c-purple)"/><text x="38" y="162" font-size="12" fill="var(--ink)">Management '+money0(mr)+' (поза baseline)</text>';}
["b6base","b6mr","b6opp"].forEach(k=>$("#"+k).oninput=b6render);
onReg("b6",b6render);b6render();
function treeRender(){const A=+$("#dA").value||0,Ap=+$("#dAp").value,Ai=+$("#dAi").value||0,B=+$("#dB").value||0,Bp=+$("#dBp").value,Bi=+$("#dBi").value||0;$("#dApv").textContent=Ap+"%";$("#dBpv").textContent=Bp+"%";
 const eA=A+Ap/100*Ai,eB=B+Bp/100*Bi;const win=eA<=eB?"A":"B";
 const node=(x,y,t,c)=>'<rect x="'+x+'" y="'+(y-14)+'" width="118" height="28" rx="6" fill="'+c+'"/><text x="'+(x+59)+'" y="'+(y+4)+'" font-size="11" text-anchor="middle" fill="#fff">'+t+'</text>';
 const leaf=(x,y,t,v)=>'<text x="'+x+'" y="'+(y-2)+'" font-size="11" fill="var(--ink)">'+t+'</text><text x="'+x+'" y="'+(y+12)+'" font-size="11" font-weight="700" fill="var(--ink)">'+v+'</text>';
 const ln=(x1,y1,x2,y2,l,hl)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+(hl?"var(--act)":"var(--ink-3)")+'" stroke-width="'+(hl?3:1.5)+'"/>'+(l?'<text x="'+((x1+x2)/2)+'" y="'+((y1+y2)/2-5)+'" font-size="10" text-anchor="middle" fill="var(--ink-3)">'+l+'</text>':"");
 let s='<rect x="4" y="116" width="26" height="26" fill="var(--ink)"/><text x="17" y="160" font-size="10" text-anchor="middle" fill="var(--ink-3)">рішення</text>';
 s+=ln(30,129,140,60,"",win==="A")+ln(30,129,140,200,"",win==="B");
 s+=node(140,60,"A: "+money0(A),win==="A"?"var(--act)":"var(--ink-3)")+node(140,200,"B: "+money0(B),win==="B"?"var(--act)":"var(--ink-3)");
 s+='<circle cx="272" cy="60" r="7" fill="var(--c-gold)"/><circle cx="272" cy="200" r="7" fill="var(--c-gold)"/>';
 s+=ln(279,60,330,30,Ap+"%")+ln(279,60,330,88,(100-Ap)+"%")+ln(279,200,330,172,Bp+"%")+ln(279,200,330,228,(100-Bp)+"%");
 s+=leaf(334,30,"проблема",money0(A+Ai))+leaf(334,88,"без проблем",money0(A))+leaf(334,172,"проблема",money0(B+Bi))+leaf(334,228,"без проблем",money0(B));
 s+='<text x="140" y="36" font-size="11" font-weight="700" fill="var(--ink)">EMV '+money0(eA)+'</text><text x="140" y="250" font-size="11" font-weight="700" fill="var(--ink)">EMV '+money0(eB)+'</text>';
 $("#dtree").innerHTML=s;
 const diff=Math.abs(eA-eB);const cheap=A<B?"A":"B";
 $("#dres").innerHTML="<div class='res'>Обираємо "+win+" — економія "+money0(diff)+" очікуваної вартості</div><div class='q'>"+(cheap!==win?"Дешевший на старті ("+cheap+") програє з урахуванням ризику. Дешевше ≠ вигідніше.":"Тут дешевший на старті варіант виграє й з урахуванням ризику.")+" Очікувана вартість = ціна + P × збиток.</div>";markDone("b6");}
["dA","dAp","dAi","dB","dBp","dBi"].forEach(k=>$("#"+k).oninput=treeRender);treeRender();

/* ================= БЛОК 7 ================= */
const TASKS=[["Дизайн",1.5,2,4],["Бекенд",3,4,6],["Фронтенд",2.5,3,5],["Інтеграції",1,1.5,3],["Тестування",1,1.5,3]];
const REV=[{n:"R1 · API провайдера вимкнуть",p:40,d:2,on:true,mit:false,mp:10,md:1,mt:"міграція в спринті 1"},{n:"R2 · Фід постачальника запізниться",p:60,d:1,on:true,mit:false,mp:60,md:0.3,mt:"ручний імпорт топ-100"},{n:"R3 · Макети запізнюються",p:30,d:1,on:false,mit:false,mp:30,md:0.5,mt:"UI-кіт і буфер"}];
function b7table(){let h="<tr><th>Задача</th><th>Оптимістично, тиж</th><th>Найімовірніше, тиж</th><th>Песимістично, тиж</th><th>Середнє (a+m+b)/3</th></tr>";
 TASKS.forEach((t,i)=>{h+="<tr><td><b>"+t[0]+"</b></td>"+[1,2,3].map(j=>"<td><input type='number' class='n' step='0.5' min='0.5' value='"+t[j]+"' data-i='"+i+"' data-j='"+j+"'></td>").join("")+"<td>"+((t[1]+t[2]+t[3])/3).toFixed(2)+"</td></tr>";});
 const sm=TASKS.reduce((a,t)=>a+t[2],0),mean=TASKS.reduce((a,t)=>a+(t[1]+t[2]+t[3])/3,0);
 h+="<tr><td><b>Разом</b></td><td></td><td><b>"+sm+"</b> ← «план»</td><td></td><td><b>"+mean.toFixed(2)+"</b></td></tr>";$("#b7t").innerHTML=h;b7swing();
 $("#b7t").querySelectorAll("input").forEach(x=>x.onchange=e=>{const i=+e.target.dataset.i,j=+e.target.dataset.j;TASKS[i][j]=Math.max(0.5,+e.target.value||0.5);const t=TASKS[i];if(t[1]>t[2])t[2]=t[1];if(t[2]>t[3])t[3]=t[2];b7table();});}
function b7risks(){const d=$("#b7r");d.innerHTML="";REV.forEach((r,i)=>{const w=el("div",{style:"padding:6px 0;border-bottom:1px solid var(--line)"});
 w.innerHTML="<label style='display:flex;gap:6px;align-items:center'><input type='checkbox' "+(r.on?"checked":"")+" data-a='on'><b>"+r.n+"</b></label><div style='font-size:.82rem;color:var(--mut);margin-left:22px'>P = "+(r.mit?r.mp:r.p)+"% · +"+(r.mit?r.md:r.d)+" тиж</div><label style='display:flex;gap:6px;align-items:center;margin-left:22px;font-size:.85rem'><input type='checkbox' "+(r.mit?"checked":"")+" data-a='mit'>реагування: "+r.mt+"</label>";
 w.querySelectorAll("input").forEach(c=>c.onchange=e=>{r[e.target.dataset.a]=e.target.checked;b7risks();});d.appendChild(w);});b7swing();}
function tri(a,m,b){const u=Math.random();const f=(m-a)/(b-a||1);return u<f?a+Math.sqrt(u*(b-a)*(m-a)):b-Math.sqrt((1-u)*(b-a)*(b-m));}
let SIM=null;
function b7run(){const N=+$("#b7n").value;const tot=[],cols=TASKS.map(()=>[]),rc=REV.map(()=>[]);
 for(let k=0;k<N;k++){let s=0;TASKS.forEach((t,i)=>{const v=tri(t[1],t[2],t[3]);cols[i].push(v);s+=v;});REV.forEach((r,i)=>{let v=0;if(r.on){const p=(r.mit?r.mp:r.p)/100;if(Math.random()<p)v=r.mit?r.md:r.d;}rc[i].push(v);s+=v;});tot.push(s);}
 const sorted=tot.slice().sort((a,b)=>a-b);SIM={tot,sorted,cols,rc};b7draw();markDone("b7");}
function corr(x,y){const n=x.length;const mx=x.reduce((a,b)=>a+b,0)/n,my=y.reduce((a,b)=>a+b,0)/n;let sxy=0,sx=0,sy=0;for(let i=0;i<n;i++){sxy+=(x[i]-mx)*(y[i]-my);sx+=(x[i]-mx)**2;sy+=(y[i]-my)**2;}return sx&&sy?sxy/Math.sqrt(sx*sy):0;}
function b7draw(){const dl=+$("#b7d").value;$("#b7dv").textContent=dl;if(!SIM){$("#b7k").innerHTML="<div class='q'>Натисніть «Запустити».</div>";return;}
 const S=SIM.sorted,n=S.length,q=p=>S[Math.min(n-1,Math.floor(p*n))];const pOk=S.filter(v=>v<=dl).length/n;const plan=TASKS.reduce((a,t)=>a+t[2],0);const pPlan=S.filter(v=>v<=plan).length/n;
 $("#b7k").innerHTML="<div class='kpis' style='grid-template-columns:1fr 1fr'><div class='kpi'><div class='v'>"+q(.5).toFixed(1)+"</div><div class='l'>P50, тижнів</div></div><div class='kpi'><div class='v'>"+q(.8).toFixed(1)+"</div><div class='l'>"+hn("p80","P80")+", тижнів</div></div><div class='kpi'><div class='v' style='color:"+(pOk>=.8?"var(--c-green)":pOk>=.5?"var(--c-gold)":"var(--c-clay)")+"'>"+Math.round(pOk*100)+"%</div><div class='l'>шанс вкластися в "+dl+" тиж</div></div><div class='kpi'><div class='v' style='color:var(--c-clay)'>"+Math.round(pPlan*100)+"%</div><div class='l'>шанс вкластися в «план» "+plan+" тиж</div></div></div>";
 const lo=Math.floor(S[0]),hi=Math.ceil(S[n-1]);const bins=[];const bw=0.5;for(let v=lo;v<hi;v+=bw)bins.push({a:v,c:0});S.forEach(v=>{const i=Math.min(bins.length-1,Math.floor((v-lo)/bw));bins[i].c++;});
 const W=760,H=260,L=46,R=16,T=18,B=40,mc=Math.max(...bins.map(b=>b.c));const X=v=>L+(v-lo)/(hi-lo||1)*(W-L-R),Y=c=>H-B-c/mc*(H-T-B);
 let s="";bins.forEach(b=>{s+='<rect x="'+(X(b.a)+1)+'" y="'+Y(b.c)+'" width="'+Math.max(1,X(b.a+bw)-X(b.a)-2)+'" height="'+(H-B-Y(b.c))+'" fill="'+(b.a+bw<=dl?"var(--c-green)":"var(--c-clay)")+'" opacity=".85"/>';});
 let cum="",acc=0;S.forEach((v,i)=>{if(i%Math.ceil(n/120)===0||i===n-1){cum+=(cum?"L":"M")+X(v).toFixed(1)+" "+(H-B-(i+1)/n*(H-T-B)).toFixed(1);}});
 s+='<path d="'+cum+'" fill="none" stroke="var(--ink)" stroke-width="2"/>';
 for(let v=lo;v<=hi;v++)s+='<text x="'+X(v)+'" y="'+(H-B+16)+'" font-size="11" text-anchor="middle" fill="var(--ink-3)">'+v+'</text>';
 s+='<text x="'+(W/2)+'" y="'+(H-4)+'" font-size="12" text-anchor="middle" fill="var(--ink-3)">тривалість, тижнів · лінія — накопичена ймовірність</text>';
 [[plan,"план","var(--ink-3)"],[q(.5),"P50","var(--act)"],[q(.8),"P80","var(--c-purple)"],[dl,"дедлайн","var(--ink)"]].forEach((m,i)=>{if(m[0]<lo||m[0]>hi)return;s+='<line x1="'+X(m[0])+'" y1="'+T+'" x2="'+X(m[0])+'" y2="'+(H-B)+'" stroke="'+m[2]+'" stroke-width="2" stroke-dasharray="'+(i===3?"0":"5 4")+'"/><text x="'+(X(m[0])+3)+'" y="'+(T+10+i*13)+'" font-size="11" font-weight="700" fill="'+m[2]+'">'+m[1]+'</text>';});
 s+='<text x="'+(L-6)+'" y="'+(T+6)+'" font-size="10" text-anchor="end" fill="var(--ink-3)">100%</text><text x="'+(L-6)+'" y="'+(H-B)+'" font-size="10" text-anchor="end" fill="var(--ink-3)">0</text>';
 $("#b7h").innerHTML=s;
 const items=TASKS.map((t,i)=>({n:t[0],c:corr(SIM.cols[i],SIM.tot)})).concat(REV.map((r,i)=>({n:r.n.split(" · ")[0]+" (подія)",c:r.on?corr(SIM.rc[i],SIM.tot):0}))).sort((a,b)=>b.c-a.c);
 let t="";const TW=760,bh=22;items.forEach((it,i)=>{const w=Math.max(0,it.c)*(TW-260);t+='<text x="180" y="'+(24+i*bh)+'" font-size="12" text-anchor="end" fill="var(--ink)">'+esc(it.n)+'</text><rect x="190" y="'+(12+i*bh)+'" width="'+w+'" height="16" rx="3" fill="'+(/подія/.test(it.n)?"var(--c-clay)":"var(--act)")+'"/><text x="'+(196+w)+'" y="'+(24+i*bh)+'" font-size="11" fill="var(--ink-3)">'+it.c.toFixed(2)+'</text>';});
 $("#b7tor").setAttribute("viewBox","0 0 760 "+(20+items.length*bh));$("#b7tor").innerHTML=t;}

/* Tornado «розмах»: кожен фактор від оптимістичного до песимістичного, решта — на базі.
   База = сума найімовірніших оцінок + очікувана затримка від увімкнених ризиків. */
let B7MODE="sw";
function b7swing(){const svg=$("#b7sw");if(!svg)return;
 const risks=REV.filter(r=>r.on).map(r=>({r,p:(r.mit?r.mp:r.p)/100,d:r.mit?r.md:r.d}));
 const base=TASKS.reduce((a,t)=>a+t[2],0)+risks.reduce((a,x)=>a+x.p*x.d,0);
 const items=TASKS.map(t=>({n:t[0],lo:base-(t[2]-t[1]),hi:base+(t[3]-t[2]),ev:false}))
  .concat(risks.map(x=>({n:x.r.n.split(" · ")[0]+" · "+x.r.n.split(" · ")[1],lo:base-x.p*x.d,hi:base+(1-x.p)*x.d,ev:true,r:x.r})))
  .map(i=>Object.assign(i,{w:i.hi-i.lo})).sort((a,b)=>b.w-a.w);
 const W=760,L=250,R=40,bh=26,T=26,H=T+items.length*bh+30;
 const mn=Math.min(...items.map(i=>i.lo)),mx=Math.max(...items.map(i=>i.hi));const pad=0.5;
 const X=v=>L+(v-(mn-pad))/((mx+pad)-(mn-pad))*(W-L-R);
 let g='<line x1="'+X(base)+'" y1="'+(T-8)+'" x2="'+X(base)+'" y2="'+(H-24)+'" stroke="var(--ink)" stroke-width="1.5"/>'+
  '<text x="'+X(base)+'" y="'+(T-12)+'" font-size="11" text-anchor="middle" font-weight="700" fill="var(--ink)">база '+base.toFixed(1)+' тиж</text>';
 items.forEach((it,i)=>{const y=T+i*bh;
  g+='<text x="'+(L-10)+'" y="'+(y+14)+'" font-size="12" text-anchor="end" fill="var(--ink)">'+esc(it.n)+'</text>';
  if(base-it.lo>0.001)g+='<rect x="'+X(it.lo)+'" y="'+(y+2)+'" width="'+(X(base)-X(it.lo))+'" height="17" rx="2" fill="var(--c-green)" opacity=".75"/>';
  if(it.hi-base>0.001)g+='<rect x="'+X(base)+'" y="'+(y+2)+'" width="'+(X(it.hi)-X(base))+'" height="17" rx="2" fill="'+(it.ev?"var(--c-clay)":"var(--act)")+'" opacity=".85"/>';
  g+='<text x="'+(X(it.hi)+6)+'" y="'+(y+14)+'" font-size="11" fill="var(--ink-3)">±'+it.w.toFixed(1)+'</text>';});
 for(let v=Math.ceil(mn-pad);v<=Math.floor(mx+pad);v++)g+='<text x="'+X(v)+'" y="'+(H-8)+'" font-size="10" text-anchor="middle" fill="var(--ink-3)">'+v+'</text>';
 svg.setAttribute("viewBox","0 0 "+W+" "+H);svg.innerHTML=g;
 const top=items[0];let tip="<b>Почніть з «"+esc(top.n)+"»</b>: розмах "+top.w.toFixed(1)+" тиж — найбільший у проєкті. ";
 if(top.ev&&!top.r.mit){tip+="Увімкніть реагування «"+esc(top.r.mt)+"» — розмах цього ризику зменшиться до "+top.r.md.toFixed(1)+" тиж.";}
 else if(top.ev)tip+="Реагування вже враховано; наступний кандидат — «"+esc((items[1]||top).n)+"».";
 else tip+="Це оцінка задачі: звузьте діапазон (spike, прототип, декомпозиція) — зараз проєкт може закінчитися від "+top.lo.toFixed(1)+" до "+top.hi.toFixed(1)+" тиж лише через неї.";
 $("#b7tip").innerHTML=tip;}
function b7setMode(m){B7MODE=m;$$("#b7mode button").forEach(b=>b.classList.toggle("pri",b.dataset.m===m));
 $("#b7swBox").style.display=m==="sw"?"":"none";$("#b7coBox").style.display=m==="co"?"":"none";
 $("#b7coNote").textContent=SIM?"":"Спершу натисніть «Запустити симуляцію» вище — кореляцію рахуємо з прогонів.";}
$("#b7mode").addEventListener("click",e=>{const b=e.target.closest("button[data-m]");if(b)b7setMode(b.dataset.m);});
$("#b7go").onclick=()=>{b7run();b7setMode(B7MODE);};$("#b7d").oninput=b7draw;b7table();b7risks();b7draw();b7setMode("sw");

/* ================= БЛОК 8 ================= */
const WZ=[["Рішення в межах моїх повноважень і обсягу проєкту?",[["Так",1],["Ні",{r:"Escalate",d:"Передайте на рівень програми, портфеля чи спонсора. Знімаємо з активного моніторингу лише тоді, коли власник вищого рівня погодився прийняти ризик."}]]],
["Ризик критичний, і причину можна прибрати змінивши план (технологію, обсяг, підрядника, строк)?",[["Так",{r:"Avoid",d:"Усуньте причину — ризик зникне. Перевірте вторинні ризики від зміни плану."}],["Ні",2]]],
["Чи є третя сторона, яка краще впорається з наслідками (страхування, SLA, fixed price)?",[["Так",{r:"Transfer",d:"Передайте наслідки за договором. Памʼятайте: ризик не зникає, а передача коштує грошей."}],["Ні",3]]],
["Вартість дій з реагування менша за EMV ризику?",[["Так",{r:"Mitigate",d:"Зменшуйте ймовірність (spike, прототип, раннє тестування, дублер) і/або вплив (модульність, feature flags, план Б)."}],["Ні",{r:"Accept",d:"Прийміть: активно (резерв часу/грошей + contingency plan) або пасивно для низьких ризиків (лише переглядаємо)."}]]]];
let wzAns=[];
function wzRender(){const w=$("#b8wiz");w.innerHTML="";let cur=0,res=null;const path=[];
 for(let i=0;i<wzAns.length;i++){const nx=WZ[cur][1][wzAns[i]][1];path.push(cur);if(typeof nx==="number")cur=nx;else{res=nx;break;}}
 WZ.forEach((q,i)=>{const active=!res&&i===cur;const answered=path.indexOf(i);const d=el("div",{cls:"wq"+(active||answered>=0?"":" dim")},"<b>"+(i+1)+". "+q[0]+"</b><div class='row' style='margin-top:6px'></div>");
  q[1].forEach((o,j)=>{const b=el("button",{cls:"btn sm"+(answered>=0&&wzAns[answered]===j?" pri":"")},o[0]);b.onclick=()=>{if(answered>=0)wzAns=wzAns.slice(0,answered);wzAns.push(j);wzRender();};d.querySelector(".row").appendChild(b);});w.appendChild(d);});
 const R=$("#b8wres");if(res){R.innerHTML="<div class='q'>Рекомендована стратегія</div><div class='res' style='font-size:1.6rem;color:var(--blue)'>"+res.r+"</div><p>"+res.d+"</p><button class='btn sm' id='wzR'>Почати знову</button>";$("#wzR").onclick=()=>{wzAns=[];wzRender();};markDone("b8");}
 else R.innerHTML="<div class='q'>Відповідайте на питання зліва по черзі. Це орієнтир, а не закон: одному ризику часто відповідає комбінація стратегій.</div>";}
wzRender();
const SCN=[["Податкова змінює правила фіскалізації для всіх онлайн-магазинів компанії, а не лише для вашого проєкту.","Escalate","Рішення і наслідки — на рівні всієї компанії, поза повноваженнями PM."],
["Експериментальний платіжний провайдер нестабільний, і збій на старті вбʼє запуск. Є перевірена альтернатива за ту саму ціну.","Avoid","Змінюємо план і прибираємо причину — ризик зникає."],
["Навантаження в «чорну пʼятницю» непередбачуване. Хостинг з автоскейлом дає SLA з компенсацією.","Transfer","Наслідки й відповідальність частково переходять до провайдера за договором."],
["Інтеграція з новим API може виявитися складною. Можна за 2 дні зробити spike і перевірити.","Mitigate","Spike зменшує невизначеність, тобто ймовірність сюрпризу."],
["Дизайнер іноді запізнюється на 1–2 дні. Вплив малий, у спринті є буфер.","Accept","Реагування дорожче за наслідки — активно приймаємо з буфером."],
["Команда може закінчити каталог раніше, якщо підключити найсильнішого розробника — і встигнути до сезону розпродажів.","Exploit","Робимо все, щоб можливість реалізувалася напевно."],
["Служба доставки пропонує спільну промоакцію: вони дають трафік, ми — знижку. Самі ми таку аудиторію не зберемо.","Share","Ділимося можливістю з партнером, який краще її використає."],
["Готовий модуль доставки може скоротити інтеграцію. Один день на перевірку сумісності підвищить шанс, що він підійде.","Enhance","Підвищуємо ймовірність позитивного результату."]];
const SALL=[["Escalate","t"],["Avoid","t"],["Transfer","t"],["Mitigate","t"],["Accept","t"],["Exploit","op"],["Share","op"],["Enhance","op"]];
let scI=0,scOk=0,scTry=0;const scOrder=shuffle(SCN.map((x,i)=>i));
function scRender8(){const c=$("#b8sc");if(scI>=SCN.length){c.innerHTML="<div class='res'>Результат: "+scOk+" з "+SCN.length+" з першої спроби</div><p class='q'>"+(scOk>=7?"Відмінно — стратегії ви розрізняєте.":scOk>=5?"Добре. Перегляньте дзеркальні пари: Avoid↔Exploit, Transfer↔Share, Mitigate↔Enhance.":"Варто ще раз пройти майстер і слайди про стратегії.")+"</p><button class='btn sm' id='scR'>Ще раз</button>";$("#scR").onclick=()=>{scI=0;scOk=0;scTry=0;scRender8();};return;}
 const s=SCN[scOrder[scI]];c.innerHTML="<div class='q'>Ситуація "+(scI+1)+" з "+SCN.length+"</div><div style='font-size:1.05rem'>"+s[0]+"</div><div class='sgrid'></div><div class='fb' id='scFb'></div>";
 SALL.forEach(a=>{const b=el("button",{cls:"btn "+a[1]},a[0]);b.onclick=()=>{const fb=$("#scFb");scTry++;if(a[0]===s[1]){if(scTry===1)scOk++;fb.className="fb ok";fb.innerHTML="✓ "+s[1]+". "+s[2]+" <button class='btn sm pri' id='scN'>Далі →</button>";$("#scN").onclick=()=>{scI++;scTry=0;scRender8();};}else{fb.className="fb bad";fb.innerHTML="✕ "+a[0]+" — не найкраще. "+(a[1]==="op"&&SALL.find(x=>x[0]===s[1])[1]==="t"?"Це стратегія для можливостей, а тут загроза.":a[1]==="t"&&SALL.find(x=>x[0]===s[1])[1]==="op"?"Це стратегія для загроз, а тут можливість.":"Подумайте, що саме змінюється: причина, власник наслідків чи ймовірність.");}};c.querySelector(".sgrid").appendChild(b);});}
scRender8();

/* ================= БЛОК 9 ================= */
const VERBS=/(надісла|надсила|провес|проведе|провод|перевіря|додає|мігрує|налаштову|підписує|створює|запуска|готує|додат|дода|перевір|мігру|мігрув|налашту|підпис|створ|домов|зустр|напис|запуст|підготу|оновит|оновлю|замін|перенес|задокумент|найня|залуч|виділ|переда|узгод|протест|ізолю|отрима|закла|зробит|зробить|розгорн|організу)/i;
const VAGUE=/(стежити|слідкувати|бути уважн|контролювати ситуацію|намагатися|по можливості|якось|звернути увагу|моніторити|тримати в курсі|пильнувати)/i;
const ROLE=/(\bpm\b|техлід|tech ?lead|qa|devops|дизайнер|аналітик|розробник|клієнт|спонсор|власник|менеджер|тестувальник|архітектор|бекенд|фронтенд|юрист|бухгалтер|[А-ЯІЇЄҐ][а-яіїєґʼ']+ [А-ЯІЇЄҐ]\.)/i;
const WHEN=/(до |у понеділок|у вівторок|у середу|у четвер|у пʼятницю|сьогодні|завтра|спринт|тиждень|тижня|днів|день|\d{1,2}\.\d{1,2}|щотижн|щодня|перед |після |кінця|кінці)/i;
const MEAS=/(\d|звіт|перевірк|\bci\b|changelog|чек-лист|задач|тікет|issue|документ|лист|протокол|confluence|jira)/i;
const B9EX=["Стежити за API","Поговорити з клієнтом","QA до кінця спринту 3 проводить навантажувальний тест на 5× трафік, звіт у Confluence","PM у вівторок надсилає клієнту лист із ризиком R1 і двома варіантами дат","Бути уважними з дедлайнами"];
B9EX.forEach(x=>{const b=el("button",{cls:"btn sm"},esc(x.length>34?x.slice(0,32)+"…":x));b.onclick=()=>{$("#b9in").value=x;b9check();};$("#b9ex").appendChild(b);});
function b9check(){const v=$("#b9in").value.trim();const o=$("#b9out");if(!v){o.innerHTML="<div class='q'>Напишіть дію або оберіть приклад.</div>";return;}
 const c=[["Конкретне дієслово дії",VERBS.test(v)&&!VAGUE.test(v),"«надіслати», «провести», «додати» замість «стежити»"],["Виконавець (роль чи імʼя)",ROLE.test(v),"хто саме: техлід, QA, PM…"],["Строк",WHEN.test(v),"до коли: «до пʼятниці», «у спринті 3»"],["Результат можна перевірити",MEAS.test(v)&&v.length>30,"число, звіт, задача, лист"]];
 const n=c.filter(x=>x[1]).length;
 let h="<b>Оцінка: "+n+" / 4</b><div class='meter' style='margin:6px 0 10px'><i style='width:"+n*25+"%;background:"+(n>=4?"var(--grn)":n>=2?"var(--org)":"var(--red)")+"'></i></div>";
 c.forEach(x=>{h+="<div class='chk "+(x[1]?"y":"n")+"'><span class='m'>"+(x[1]?"✓":"✕")+"</span><span><b>"+x[0]+"</b>"+(x[1]?"":"<br><small class='q'>"+x[2]+"</small>")+"</span></div>";});
 if(VAGUE.test(v))h+="<div class='warn'>Знайдено розмите формулювання: «"+esc(v.match(VAGUE)[0])+"». Так план не виконується — ніхто не знає, коли він «виконаний».</div>";
 if(n===4){h+="<div class='fb ok'>✓ Такий план можна покласти задачею в беклог.</div>";markDone("b9");}
 o.innerHTML=h;}
$("#b9in").oninput=b9check;b9check();

/* ================= БЛОК 10 ================= */
const VERS=[["v1 · Опис",["id","type","title","cat"]],["v2 · Аналіз",["id","type","title","P","I","score","pct","cost","emv"]],["v3 · Реагування",["id","title","score","owner","strat","act","trig"]],["v4 · Моніторинг",["id","title","score","owner","strat","trig","status"]],["Повний",["id","type","title","cat","P","I","score","pct","cost","emv","owner","strat","act","trig","status"]]];
const COLN={id:"ID",type:"Тип",title:"Ризик (формула)",cat:"Категорія",P:"P",I:"I",score:"Score / зона",pct:"P, %",cost:"Вплив, $",emv:"EMV",owner:"Власник",strat:"Стратегія",act:"Дії з реагування",trig:"Тригер",status:"Статус"};
let vIdx=store.get("ver",4);
function sel(opts,v,f,id){return "<select data-id='"+id+"' data-f='"+f+"'>"+opts.map(o=>"<option"+(o===v?" selected":"")+">"+esc(o)+"</option>").join("")+"</select>";}
function cellHtml(r,c){const s=score(r),z=zone(s);switch(c){
 case "id":return "<b>"+r.id+"</b><br><button class='btn sm' data-del='"+r.id+"' title='Видалити'>✕</button>";
 case "type":return "<select data-id='"+r.id+"' data-f='type'><option value='t'"+(r.type==="t"?" selected":"")+">Загроза</option><option value='o'"+(r.type==="o"?" selected":"")+">Можливість</option></select>";
 case "title":return "<textarea data-id='"+r.id+"' data-f='title'>"+esc(r.title)+"</textarea>";
 case "cat":return sel(CATS,r.cat,"cat",r.id);
 case "P":case "I":return "<select data-id='"+r.id+"' data-f='"+c+"' data-num='1'>"+[1,2,3,4,5].map(n=>"<option"+(n===r[c]?" selected":"")+">"+n+"</option>").join("")+"</select>";
 case "score":return "<b>"+s+"</b><br><span class='pill "+(r.type==="o"?"opp":"z"+z)+"'>"+ZN[z]+(r.type==="o"?" +":"")+"</span>";
 case "pct":return "<input type='number' class='n' min='0' max='100' step='5' data-id='"+r.id+"' data-f='pct' data-num='1' value='"+r.pct+"'>";
 case "cost":return "<input type='number' class='n' style='width:84px' min='0' step='500' data-id='"+r.id+"' data-f='cost' data-num='1' value='"+r.cost+"'>";
 case "emv":return "<b style='color:"+(emv(r)<0?"var(--c-clay)":"var(--c-green)")+";white-space:nowrap'>"+money(emv(r))+"</b>";
 case "owner":return "<input type='text' data-id='"+r.id+"' data-f='owner' value='"+esc(r.owner)+"' placeholder='одна людина'>";
 case "strat":return sel(r.type==="o"?STRAT_O:STRAT_T,r.strat,"strat",r.id);
 case "act":return "<textarea data-id='"+r.id+"' data-f='act' placeholder='хто, що, до коли'>"+esc(r.act)+"</textarea>";
 case "trig":return "<input type='text' class='w' data-id='"+r.id+"' data-f='trig' value='"+esc(r.trig)+"' placeholder='вимірюваний сигнал'>";
 case "status":return sel(STATUS,r.status,"status",r.id);}return "";}
function b10render(){$("#b10tabs").innerHTML="";VERS.forEach((v,i)=>{const t=el("span",{cls:"tab"+(i===vIdx?" on":"")},v[0]);t.onclick=()=>{vIdx=i;store.set("ver",i);b10render();};$("#b10tabs").appendChild(t);});
 const cols=VERS[vIdx][1];const f=$("#b10f").value,so=$("#b10s").value;
 let rows=REG.slice();
 if(f==="z4")rows=rows.filter(r=>r.type==="t"&&zone(score(r))===4);if(f==="z3")rows=rows.filter(r=>r.type==="t"&&zone(score(r))>=3);if(f==="open")rows=rows.filter(r=>r.status!=="Закритий");if(f==="opp")rows=rows.filter(r=>r.type==="o");if(f==="iss")rows=rows.filter(r=>issues(r).length);
 if(so==="score")rows.sort((a,b)=>score(b)-score(a));if(so==="emv")rows.sort((a,b)=>Math.abs(emv(b))-Math.abs(emv(a)));
 let h="<tr>"+cols.map(c=>"<th>"+(c==="owner"?hn("owner","Власник"):c==="trig"?hn("trigger","Тригер"):c==="emv"?hn("emv","EMV"):COLN[c])+"</th>").join("")+"</tr>";
 rows.forEach(r=>{h+="<tr>"+cols.map(c=>"<td>"+cellHtml(r,c)+"</td>").join("")+"</tr>";const is=issues(r);if(is.length)h+="<tr><td></td><td colspan='"+(cols.length-1)+"' style='border-bottom:1px solid var(--line);padding-top:0'><div class='iss'>⚠ "+is.map(esc).join(" · ")+"</div></td></tr>";});
 if(!rows.length)h+="<tr><td colspan='"+cols.length+"' class='q'>Немає рядків за цим фільтром.</td></tr>";
 const t=$("#b10t");t.innerHTML=h;
 t.querySelectorAll("[data-f]").forEach(x=>{const ev=x.tagName==="SELECT"?"change":"change";x.addEventListener(ev,e=>{const r=REG.find(y=>y.id===e.target.dataset.id);if(!r)return;let v=e.target.value;if(e.target.dataset.num)v=Math.max(0,+v||0);if(e.target.dataset.f==="pct"&&v>100)v=100;
  if(e.target.dataset.f==="type"&&v!==r.type){r.type=v;r.strat="—";const nid=nextId(v);r.id=nid;}else r[e.target.dataset.f]=v;regChanged("b10");b10render();if(REG.length>=5&&REG.every(z=>!issues(z).length))markDone("b10");});});
 t.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{REG=REG.filter(r=>r.id!==b.dataset.del);regChanged("b10");b10render();});
 const open=REG.filter(r=>r.status!=="Закритий");const exp=open.reduce((a,r)=>a+emv(r),0);const crit=open.filter(r=>r.type==="t"&&zone(score(r))===4).length;const iss=REG.reduce((a,r)=>a+issues(r).length,0);
 $("#b10k").innerHTML=[["Відкритих ризиків",open.length],["Критичних загроз",crit],["Експозиція (EMV)",money(exp)],["Зауважень до якості",iss]].map((k,i)=>"<div class='kpi'><div class='v' style='color:"+(i===3?(k[1]?"var(--c-clay)":"var(--c-green)"):"inherit")+"'>"+k[1]+"</div><div class='l'>"+(i===2?hn("exposure",k[0]):k[0])+"</div></div>").join("");}
$("#b10f").onchange=b10render;$("#b10s").onchange=b10render;
$("#b10add").onclick=()=>{REG.push({id:nextId("t"),type:"t",title:"",cat:CATS[0],P:3,I:3,pct:30,cost:1000,owner:"",strat:"—",act:"",trig:"",status:"Відкритий"});regChanged("b10");vIdx=4;b10render();};
$("#b10addo").onclick=()=>{REG.push({id:nextId("o"),type:"o",title:"",cat:CATS[3],P:3,I:3,pct:30,cost:1000,owner:"",strat:"—",act:"",trig:"",status:"Відкритий"});regChanged("b10");vIdx=4;b10render();};
$("#b10ex").onclick=()=>{REG=JSON.parse(JSON.stringify(SAMPLE));regChanged("b10");b10render();};
$("#b10clr").onclick=()=>{if(typeof confirm==="function"&&!confirm("Очистити реєстр?"))return;REG=[];regChanged("b10");b10render();};
$("#b10csv").onclick=()=>{const cs=VERS[4][1].filter(c=>c!=="score");const q=v=>'"'+String(v).replace(/"/g,'""')+'"';
 const lines=[cs.map(c=>q(COLN[c])).concat([q("Score"),q("Зона")]).join(";")].concat(REG.map(r=>cs.map(c=>q(c==="type"?(r.type==="o"?"Можливість":"Загроза"):c==="emv"?Math.round(emv(r)):r[c])).concat([score(r),q(ZN[zone(score(r))])]).join(";")));
 const txt=lines.join("\n");$("#b10csvout").style.display="block";$("#b10csvtxt").value=txt;
 try{const blob=new Blob(["\ufeff"+txt],{type:"text/csv;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="risk_register.csv";document.body.appendChild(a);a.click();a.remove();}catch(e){}};
onReg("b10",b10render);b10render();

/* ================= БЛОК 11 ================= */
const EV=[
{t:"Спринт 1",s:"Платіжний провайдер надіслав лист: стара версія API буде вимкнена через 5 тижнів. Реліз — через 8.",c:[
 ["Мігрувати на нову версію вже в цьому спринті (Mitigate)",{d:-3,m:0,e:-8,tr:1,flag:"api_ok"},"Витратили 3 дні резерву, але R1 майже закрито. Спонсору подобається проактивність."],
 ["Почекати: може, дату перенесуть (пасивне Accept)",{d:0,m:0,e:0,tr:0,flag:"api_wait"},"Нічого не витратили… поки що. Ризик лишається високим."],
 ["Ескалювати спонсору, хай вирішує",{d:0,m:0,e:0,tr:-1},"Спонсор здивований: це технічне рішення у ваших повноваженнях. Ризик не зменшився."]]},
{t:"Спринт 2",s:"На ретро зʼясувалося: техлід іде у відпустку на два тижні якраз у сезон розпродажів. У реєстрі цього немає.",c:[
 ["Додати ризик R5, призначити дублера і провести передачу знань (Mitigate)",{d:-1,m:0,e:3,tr:1,flag:"lead_ok"},"Новий ризик у реєстрі з власником. Експозиція трохи зросла — і це чесно."],
 ["Не заносити: до сезону ще далеко",{d:0,m:0,e:0,tr:0,flag:"lead_ign"},"Реєстр виглядає гарно. Ризик нікуди не подівся."],
 ["Попросити техліда перенести відпустку",{d:0,m:0,e:0,tr:-1,flag:"lead_ign"},"Техлід погодився, але незадоволений. Ризик вигорання зріс, а ризик відсутності — ні, лише відкладений."]]},
{t:"Спринт 3",s:"Тригер R2 спрацював: фід каталогу від постачальника не надійшов, до наповнення — 3 дні.",c:[
 ["Запустити contingency plan: ручний імпорт топ-100 товарів, завести issue",{d:-2,m:-500,e:-4,tr:1},"План заздалегідь — і паніки немає. Ризик став проблемою, і вона під контролем."],
 ["Почекати ще тиждень",{d:-5,m:0,e:0,tr:-1},"Фід прийшов через 6 днів. Наповнення зсунулося, резерв часу тане."],
 ["Тихо перекласти на клієнта: «це ж ваш постачальник»",{d:-3,m:0,e:0,tr:-2},"Клієнт дізнався останнім. Довіра впала, а затримка все одно сталася."]]},
{t:"Спринт 4",s:"Навантажувальний тест: при 3× трафіку все гаразд, при 5× — сайт падає. До «чорної пʼятниці» — 5 тижнів.",pre:true,c:[
 ["Перейти на хостинг з автоскейлом і SLA (Transfer + Mitigate)",{d:-1,m:-1500,e:-6,tr:1},"Витратили частину грошового резерву, але R4 тепер у зеленій зоні. Врахуйте вторинний ризик міграції."],
 ["Оптимізувати кешування своїми силами (Mitigate)",{d:-4,m:0,e:-4,tr:0},"Тест 5× пройдено ледь-ледь. Витратили час, ризик знижено частково."],
 ["Прийняти: може, стільки людей і не прийде",{d:0,m:0,e:0,tr:-1},"Критичний ризик з пасивним прийняттям. Спонсор просить пояснити, на чому базується оптимізм."]]},
{t:"Спринт 5",s:"Хороша новина: готовий модуль доставки сумісний з вашою платформою (можливість O1).",c:[
 ["Exploit: підключити найсильнішого розробника й завершити інтеграцію цього спринту",{d:4,m:0,e:0,tr:1},"Інтеграцію закрили на тиждень раніше — резерв часу поповнився."],
 ["Share: запропонувати службі доставки спільну промоакцію",{d:1,m:500,e:0,tr:1},"Партнер доплатив за промо. Трохи часу і грошей виграли."],
 ["Нічого не робити: і так піде за планом",{d:0,m:0,e:0,tr:0},"Можливість реалізувалась частково. Реєстр — не лише про неприємності."]]},
{t:"Спринт 6",s:"Спонсор перед сезоном питає: «Як у нас із ризиками? Чи можу я спати спокійно?»",c:[
 ["Показати risk report: топ-5, burndown експозиції, залишок резервів",{d:0,m:0,e:0,tr:1,report:true},"Чесна картина з цифрами. Спонсор бачить тренд і те, що резерви контрольовані."],
 ["«Все під контролем, не хвилюйтеся»",{d:0,m:0,e:0,tr:0,calm:true},"Спонсор повірив… поки що."],
 ["Надіслати весь реєстр на 30 рядків без коментарів",{d:0,m:0,e:0,tr:-1},"Спонсор не має часу розбиратися. Звіт має відповідати на питання аудиторії."]]}];
let SM;
function smReset(){SM={i:0,d:10,m:5000,e:37,tr:3,hist:[37],log:[],flags:{},done:false};smRender();}
function smRender(){const k=$("#b11k");const col=(v,a,b)=>v<=a?"var(--c-clay)":v<=b?"var(--c-gold)":"var(--c-green)";
 k.innerHTML="<div class='kpi'><div class='v' style='color:"+col(SM.d,2,5)+"'>"+SM.d+" дн</div><div class='l'>резерв часу</div></div><div class='kpi'><div class='v' style='color:"+col(SM.m,1000,2500)+"'>"+money0(SM.m)+"</div><div class='l'>резерв грошей</div></div><div class='kpi'><div class='v'>"+SM.e+"</div><div class='l'>"+hn("exposure","експозиція")+" (сума score)</div></div><div class='kpi'><div class='v'>"+"★".repeat(Math.max(0,SM.tr))+"<span style='color:#ccd'>"+"★".repeat(Math.max(0,5-SM.tr))+"</span></div><div class='l'>довіра спонсора</div></div>";
 const ev=$("#b11ev");
 if(SM.i>=EV.length){SM.done=true;const sc=(SM.d>0?1:0)+(SM.m>0?1:0)+(SM.e<=20?1:0)+(SM.tr>=4?1:0);const grade=["Проєкт у кризі","Важкий запуск","Непогано","Добре","Зразкове управління ризиками"][sc];
  ev.innerHTML="<div class='kick'>Підсумок</div><h3 style='margin-top:4px'>"+grade+"</h3><p>Резерв часу: <b>"+SM.d+" дн</b> · грошей: <b>"+money0(SM.m)+"</b> · експозиція: <b>"+SM.hist[0]+" → "+SM.e+"</b> · довіра: <b>"+SM.tr+"/5</b></p><p class='q'>Висновки: ранні дії дешевші за пізні; нові ризики треба заносити, навіть якщо це «псує» картину; contingency plan знімає паніку; можливості теж треба свідомо використовувати; звіт — для аудиторії, а не «про все».</p><button class='btn pri' id='smR'>Зіграти ще раз</button>";$("#smR").onclick=smReset;markDone("b11");smChart();return;}
 const e=EV[SM.i];let pre="";
 if(SM.i===3&&SM.flags.api_wait){pre="<div class='warn'>⚠ Наслідок спринту 1: провайдер не переніс дату. Термінова міграція посеред спринту: −6 днів резерву, спонсор незадоволений.</div>";}
 if(SM.i===4&&SM.flags.lead_ign){pre="<div class='warn'>⚠ Техлід пішов у відпустку, дублера немає: два рішення чекали тиждень. −3 дні резерву.</div>";}
 ev.innerHTML="<div class='kick'>"+e.t+" з 6</div>"+pre+"<p style='font-size:1.05rem'>"+e.s+"</p>";
 e.c.forEach(ch=>{const b=el("button",{cls:"btn ch"},esc(ch[0]));b.onclick=()=>smPick(ch);ev.appendChild(b);});smChart();}
function smPick(ch){const f=ch[1];
 if(SM.i===3&&SM.flags.api_wait){SM.d-=6;SM.tr-=1;SM.e-=4;SM.log.push("⚠ Термінова міграція API: −6 дн");}
 if(SM.i===4&&SM.flags.lead_ign){SM.d-=3;SM.log.push("⚠ Відсутність техліда: −3 дн");}
 SM.d+=f.d;SM.m+=f.m;SM.e=Math.max(0,SM.e+f.e);SM.tr=Math.max(0,Math.min(5,SM.tr+f.tr));if(f.flag)SM.flags[f.flag]=1;
 if(f.calm){if(SM.e>20){SM.tr-=1;ch=[ch[0],f,ch[2]+" Але експозиція "+SM.e+" — висока, і за тиждень спонсор дізнається про проблеми не від вас. −1 довіри."];}}
 if(SM.i===0||SM.i===1||SM.i===2||SM.i===4){SM.e=Math.max(0,SM.e-2);} // природне закриття ризиків з часом
 SM.hist.push(SM.e);SM.log.push("<b>"+EV[SM.i].t+":</b> "+esc(ch[0])+" — "+esc(ch[2]));SM.i++;
 $("#b11log").innerHTML=SM.log.slice().reverse().map(x=>"<div>"+x+"</div>").join("");smRender();}
function smChart(){const W=420,H=200,L=34,B=28,T=24,R=10;const hs=SM.hist;const mx=Math.max(40,...hs);const X=i=>L+i*(W-L-R)/6,Y=v=>H-B-v/mx*(H-T-B);
 let s='<text x="'+L+'" y="14" font-size="12" font-weight="700" fill="var(--ink)">'+hn2("Risk burndown")+'</text>';
 for(let i=0;i<=6;i++)s+='<text x="'+X(i)+'" y="'+(H-10)+'" font-size="10" text-anchor="middle" fill="var(--ink-3)">'+(i===0?"старт":"С"+i)+'</text>';
 s+='<line x1="'+L+'" y1="'+Y(0)+'" x2="'+(W-R)+'" y2="'+Y(0)+'" stroke="var(--rule)"/>';
 s+='<line x1="'+X(0)+'" y1="'+Y(hs[0])+'" x2="'+X(6)+'" y2="'+Y(8)+'" stroke="var(--ink-3)" stroke-dasharray="4 4"/><text x="'+X(6)+'" y="'+(Y(8)-6)+'" font-size="10" text-anchor="end" fill="var(--ink-3)">ціль</text>';
 s+='<polyline fill="none" stroke="var(--act)" stroke-width="3" points="'+hs.map((v,i)=>X(i)+","+Y(v)).join(" ")+'"/>';
 hs.forEach((v,i)=>{s+='<circle cx="'+X(i)+'" cy="'+Y(v)+'" r="4" fill="var(--act)"/><text x="'+X(i)+'" y="'+(Y(v)-8)+'" font-size="10" text-anchor="middle" fill="var(--ink)">'+v+'</text>';});
 $("#b11ch").innerHTML=s;}
function hn2(t){return esc(t);}
smReset();

/* ================= БЛОК 12 ================= */
const AUD=[
["ID","Ризик","Власник","P","I","Score / зона","Стратегія","Дії","Тригер","Оновлено"],
[["A1"],["Проблеми з оплатою",1,"Не ризик, а тема: немає причини, події, ефекту."],["Техлід"],["3"],["4"],["12 · Високий"],["Mitigate"],["Техлід у спринті 1 мігрує на нову версію API"],["Лист провайдера про депрекацію"],["2 дні тому"]],
[["A2"],["Немає тестувальника в команді",2,"Це причина (факт). Ризик — що через це дефекти потраплять у прод."],["PM"],["4"],["4"],["16 · Критичний"],["Mitigate"],["PM до пʼятниці домовляється про QA на 0,5 ставки"],["Дефекти на демо > 3"],["2 дні тому"]],
[["A3"],["Через пік трафіку сайт може впасти в «чорну пʼятницю», що призведе до втрати продажів"],["Команда",3,"«Команда» — не власник. Одна конкретна людина."],["4"],["5"],["20 · Низький",4,"4 × 5 = 20 — це критична зона, не низька."],["Accept",5,"Критичний ризик з пасивним Accept без резерву і плану."],["—"],["—"],["2 дні тому"]],
[["A4"],["Через завантаженість клієнта погодження макетів можуть займати тиждень, що зсуне фронтенд"],["PM"],["3"],["3"],["9 · Високий"],["Mitigate"],["Стежити за ситуацією",6,"Розмита дія: хто, що, до коли?"],["Щось піде не так",7,"Тригер не вимірюваний."],["2 дні тому"]],
[["A5"],["Сервер продакшну впав учора ввечері",8,"Це вже сталося — проблема (issue), їй місце в журналі проблем."],["DevOps"],["5"],["5"],["25 · Критичний"],["Avoid"],["DevOps відновлює з бекапу сьогодні"],["—"],["2 дні тому"]]];
const AUDN=8;let audF=new Set(),audM=0;
function audRender(){const t=$("#b12t");let h="<tr>"+AUD[0].map(c=>"<th>"+c+"</th>").join("")+"</tr>";
 AUD.slice(1).forEach((r,ri)=>{h+="<tr>"+r.map((c,ci)=>{const k=c[1];return "<td data-k='"+(k||"")+"' data-rc='"+ri+"-"+ci+"' class='"+(k&&audF.has(k)?"found":"")+"'>"+esc(c[0])+"</td>";}).join("")+"</tr>";});
 t.innerHTML=h;t.querySelectorAll("td").forEach(td=>td.onclick=()=>{const k=+td.dataset.k;if(k){if(!audF.has(k)){audF.add(k);audRender();}}else{audM++;td.style.background="var(--paper-2)";setTimeout(()=>{td.style.background="";},400);audStat();}});audStat();}
function audStat(){$("#b12s").textContent="Знайдено "+audF.size+" / "+AUDN;$("#b12m").textContent="Промахів: "+audM;const L=$("#b12log");const all=[];AUD.slice(1).forEach(r=>r.forEach(c=>{if(c[1]&&audF.has(c[1]))all.push([c[1],c[2]]);}));all.sort((a,b)=>a[0]-b[0]);
 L.innerHTML=all.map(x=>"<div class='fb ok' style='display:block;margin-top:6px'>✓ "+esc(x[1])+"</div>").join("")+(audF.size===AUDN?"<div class='fb ok' style='display:block;margin-top:6px'><b>Усі 8 знайдено.</b> Ще одна системна помилка цього реєстру: у ньому немає жодної можливості — лише загрози.</div>":"");if(audF.size===AUDN)markDone("b12");}
$("#b12show").onclick=()=>{for(let i=1;i<=AUDN;i++)audF.add(i);audRender();};$("#b12r").onclick=()=>{audF=new Set();audM=0;audRender();};audRender();

/* ================= БЛОК 13 ================= */
function glRender(){const q=($("#b13q").value||"").toLowerCase();const items=Object.keys(GLOSS).map(k=>GLOSS[k]).concat(EXTRA_GL).filter(g=>!q||(g[0]+g[1]).toLowerCase().includes(q));
 $("#b13g").innerHTML=items.map(g=>"<div class='card'><b>"+esc(g[0])+"</b><div style='font-size:.88rem'>"+esc(g[1])+"</div></div>").join("")||"<div class='q'>Нічого не знайдено.</div>";}
$("#b13q").oninput=()=>{glRender();markDone("b13");};glRender();

spy();
window.__RISK_OK__=true;
})();
