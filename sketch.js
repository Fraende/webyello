// ---- Demo builder: a realistic, clickable example homepage for five kinds of business ----
// The visitor's own business name runs through every template. Everything stays in this
// browser: nothing typed, booked, ordered or "paid" in the mockup is sent anywhere.
Object.assign(I18N.fi,{
  sk_h2:"Näe verkkosivusi jo ennen ensimmäistä puhelua.",
  sk_p:"Kirjoita yrityksesi nimi ja valitse sivuston tyyppi. Saat esimerkkisivun, jota voi klikkailla kuin oikeaa — ajanvaraus, tilaus ja kassa mukaan lukien. Oikean sivuston suunnittelemme yhdessä kanssasi.",
  sk_name:"Yrityksesi nimi",
  sk_type:"Millainen sivusto?",
  sk_t_burger:"Burgeripaikka",sk_t_cafe:"Kahvila",sk_t_hair:"Kampaamo",sk_t_plumber:"Putkimies",sk_t_shop:"Pieni verkkokauppa",
  sk_cta:"Paljonko se maksaisi?",
  sk_note:"Mitään ei lähetetä minnekään — tämä pysyy selaimessasi.",
  sk_stamp:"Demo",
  sk_demo:"Kuvitteellinen esimerkkiyritys. Varaukset, tilaukset ja maksut ovat vain mallia.",
  sk_scheme:"Värimaailma",sk_s_warm:"Lämmin ja kodikas",sk_s_clean:"Selkeä ja asiallinen",sk_s_playful:"Värikäs ja leikkisä",sk_s_industrial:"Teollinen"
});

(function(){
// Invented demo names: the placeholder per type, and what the mockup shows while the field is empty
const SK_NAME={burger:['Savu Burger','Savu Burger'],cafe:['Kahvila Kaneli','Café Kaneli'],hair:['Kampaamo Sointu','Salon Sointu'],plumber:['Putkiapu Virta','Virta Plumbing'],shop:['Hehku Studio','Hehku Studio']};
const SK_TITLE={burger:['Burgerit Helsingissä','Burgers in Helsinki'],cafe:['Kahvila ja lounas','Café and lunch'],hair:['Ajanvaraus verkossa','Book online'],plumber:['LVI-työt ja päivystys','Plumbing, 24/7'],shop:['Käsin valetut kynttilät','Hand-poured candles']};

const skEl=id=>document.getElementById(id);
const L=(f,e)=>lang==='fi'?f:e;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur=n=>lang==='fi'?n.toFixed(2).replace('.',',')+' €':'€'+n.toFixed(2);
const eur0=n=>lang==='fi'?n+' €':'€'+n;
const clk=(h,m)=>lang==='fi'?h+'.'+String(m).padStart(2,'0'):String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
const WD=[['su','Sun'],['ma','Mon'],['ti','Tue'],['ke','Wed'],['to','Thu'],['pe','Fri'],['la','Sat']];
const MO='Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const dl=d=>lang==='fi'?WD[d.getDay()][0]+' '+d.getDate()+'.'+(d.getMonth()+1)+'.':WD[d.getDay()][1]+' '+d.getDate()+' '+MO[d.getMonth()];
// The next n days from today (+from), optionally skipping Sundays
function skDays(n,from,noSun){
  const o=[],d=new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+from);
  while(o.length<n){ if(!(noSun&&d.getDay()===0)) o.push(new Date(d)); d.setDate(d.getDate()+1); }
  return o;
}

let skT='burger';
// Colour schemes: one palette per mood, with a per-type accent so a café and a plumber still differ.
// Every text pair is checked to 4.5:1 or better. Industrial puts dark text on its bright accents.
const SCH={
  warm:{bg:'#F7F0E6',ink:'#2B1E16',mut:'#6B5747',soft:'#EEE1CF',line:'#E0CFB8',card:'#FFFBF5',on:'#FFFFFF',alt:'#A63A1E',alton:'#FFFFFF',deep:'#3A281D',dink:'#F7EDE0',dmut:'#D8C4AE',dacc:'#E9C79E',
    acc:{burger:'#A63A1E',cafe:'#7A4A2E',hair:'#8A3A52',plumber:'#8A4A22',shop:'#4F6B3A'}},
  clean:{bg:'#FFFFFF',ink:'#0F172A',mut:'#4B5768',soft:'#F1F4F8',line:'#E2E8F0',card:'#FFFFFF',on:'#FFFFFF',alt:'#B91C1C',alton:'#FFFFFF',deep:'#0F172A',dink:'#F8FAFC',dmut:'#CBD5E1',dacc:'#93C5FD',
    acc:{burger:'#B91C1C',cafe:'#334155',hair:'#6B2D5C',plumber:'#1D4ED8',shop:'#15803D'}},
  playful:{bg:'#FFF8EC',ink:'#1E1546',mut:'#5A5078',soft:'#FFE7A8',line:'#F3D9A4',card:'#FFFFFF',on:'#FFFFFF',alt:'#D42A1C',alton:'#FFFFFF',deep:'#1E1546',dink:'#FFF8EC',dmut:'#D9D2F5',dacc:'#FFD166',
    acc:{burger:'#D42A1C',cafe:'#B0256E',hair:'#7B3FC4',plumber:'#0D6EA8',shop:'#0F7A5F'}},
  industrial:{bg:'#E7E6E2',ink:'#111111',mut:'#4A4A47',soft:'#D6D5D0',line:'#BDBCB6',card:'#F4F4F1',on:'#111111',alt:'#F26B1D',alton:'#111111',deep:'#161616',dink:'#F2F2EE',dmut:'#B8B8B2',dacc:'#FFB300',
    acc:{burger:'#FF5B1F',cafe:'#E0A526',hair:'#E87FA9',plumber:'#FFB300',shop:'#8CC63F'}}
};
// Each type opens in the scheme that suits it; once the visitor picks one, it sticks across types
const SCH_DEF={burger:'playful',cafe:'warm',hair:'clean',plumber:'industrial',shop:'warm'};
let skS=null;
const skScheme=()=>skS||SCH_DEF[skT];
function skPaint(){
  const m=skEl('skMock'),k=skScheme(),c=SCH[k],a=c.acc[skT];
  m.dataset.s=k;
  ['bg','ink','mut','soft','line','card','on','alt','alton','deep','dink','dmut','dacc'].forEach(n=>m.style.setProperty('--s-'+n,c[n]));
  m.style.setProperty('--s-acc',a);
  m.style.setProperty('--s-atext',k==='industrial'?c.ink:a);
  const r=document.querySelector('input[name=skScheme][value='+k+']'); if(r) r.checked=true;
}

function skName(){ return skEl('skName').value.trim().replace(/\s+/g,' '); }
const N=()=>esc(skName()||SK_NAME[skT][lang==='fi'?0:1]);
function skSlug(name){
  const full=name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  let s=full;
  if(s.length>24){
    s=s.slice(0,24);
    const cut=s.lastIndexOf('-');
    if(full[24]!=='-'&&cut>8) s=s.slice(0,cut); // don't leave half a word ("...-p.fi")
    s=s.replace(/-+$/,'');
  }
  return (s||'yritys')+'.fi';
}
const SLUG=()=>skSlug(skName()||SK_NAME[skT][0]);
const MAIL=()=>L('hei@','hello@')+SLUG();

// ---- Shared building blocks ----
const chip=(a,v,on,label,dis)=>`<button type="button" class="s-chip" data-a="${a}" data-v="${v}" aria-pressed="${on}"${dis?' disabled':''}>${label}</button>`;
const btn=(a,v,label,cls,dis)=>`<button type="button" class="s-btn${cls?' '+cls:''}" data-a="${a}"${v!=null?` data-v="${v}"`:''}${dis?' disabled':''}>${label}</button>`;
const field=(k,label,area)=>{
  const v=esc((S[skT].f||{})[k]||'');
  return `<label class="s-field">${label}${area?`<textarea data-f="${k}" rows="3" autocomplete="off">${v}</textarea>`:`<input type="text" data-f="${k}" value="${v}" autocomplete="off">`}</label>`;
};
function snav(links,right){
  return `<div class="s-nav"><span class="s-logo">${N()}</span><div class="s-links">${links.map(l=>`<button type="button" data-a="go" data-v="${l[0]}">${l[1]}</button>`).join('')}</div>${right||''}</div>`;
}
function sfoot(){
  return `<div class="s-foot"><span class="s-logo">${N()}</span><p>Demokatu 12, 00100 Helsinki · 040 000 0000 · ${MAIL()}</p><small>© ${new Date().getFullYear()} ${N()} · ${L('Kuvitteellinen demoyritys. Sivuston teki WebYello.','A fictional demo business. Site by WebYello.')}</small></div>`;
}
const thanks=()=>L(N()+' kiittää!','Thank you from '+N()+'!');
function done(body,again){
  return `<div class="s-done"><span class="s-tick" aria-hidden="true"></span><p class="s-h" tabindex="-1" data-focus>${thanks()}</p><p>${body}</p><p class="s-demo">${L('Tämä on demo: mitään ei varattu, lähetetty eikä veloitettu.','This is a demo: nothing was booked, sent or charged.')}</p>${btn(again,null,L('Aloita alusta','Start over'),'ghost')}</div>`;
}
// Opening hours: rows of [days (0=Sun), fi label, en label, fi hours, en hours]; today is marked
function hours(rows){
  const t=new Date().getDay();
  return `<ul class="s-hrs">${rows.map(r=>{const on=r[0].includes(t);return `<li${on?' class="on"':''}><span>${L(r[1],r[2])}${on?`<em>${L('tänään','today')}</em>`:''}</span><span>${L(r[3],r[4])}</span></li>`;}).join('')}</ul>`;
}
const todayHours=rows=>{const r=rows.find(r=>r[0].includes(new Date().getDay()));return r?L(r[3],r[4]):null;};
const MAP=`<svg class="s-map" viewBox="0 0 240 140" aria-hidden="true"><rect class="k2" width="240" height="140"/><path class="kr" d="M0 46h240M0 100h240M70 0v140M168 0v140" stroke-width="10"/><path class="kr" d="M0 128L240 18" stroke-width="5"/><rect class="k3" x="86" y="60" width="62" height="30"/><path class="k1" d="M117 22c-11 0-18 8-18 17 0 13 18 30 18 30s18-17 18-30c0-9-7-17-18-17z"/><rect class="kb" x="112" y="34" width="10" height="10"/></svg>`;
function visit(rows){
  return `<div class="s-sec s-two" data-sec="visit"><div>${MAP}</div><div><p class="s-h">${L('Löydä meille','Find us')}</p><p class="s-addr">Demokatu 12, 00100 Helsinki<br>040 000 0000<br>${MAIL()}</p>${hours(rows)}</div></div>`;
}

// ---- Illustrations (inline SVG: no extra requests, a few hundred bytes each) ----
const SVG={
  burger:`<svg class="s-ill" viewBox="0 0 220 170" aria-hidden="true"><path fill="#E8A13A" d="M30 76C30 22 190 22 190 76z"/><g fill="#FFF3DC"><ellipse cx="78" cy="48" rx="5" ry="2.5"/><ellipse cx="108" cy="38" rx="5" ry="2.5"/><ellipse cx="140" cy="46" rx="5" ry="2.5"/><ellipse cx="120" cy="58" rx="5" ry="2.5"/><ellipse cx="92" cy="62" rx="5" ry="2.5"/><ellipse cx="160" cy="62" rx="5" ry="2.5"/></g><path fill="#6BA34A" d="M22 78h176l-8 12-11-6-11 6-11-6-11 6-11-6-11 6-11-6-11 6-11-6-11 6-11-6-11 6-11-6-11 6-12-6z"/><rect fill="#4A2416" x="24" y="94" width="172" height="26" rx="10"/><path fill="#F6C945" d="M28 88h164v8l-22 14-14-12-30 12-26-12-24 14-20-14H28z"/><rect fill="#D2381E" x="34" y="120" width="152" height="9"/><path fill="#E8A13A" d="M30 129h160v10c0 11-8 16-18 16H48c-10 0-18-5-18-16z"/></svg>`,
  cup:`<svg class="s-ill" viewBox="0 0 220 170" aria-hidden="true"><path d="M92 46c-9-10 9-16 0-28M112 42c-9-10 9-16 0-28M132 46c-9-10 9-16 0-28" fill="none" stroke="#E9DFD0" stroke-width="5" stroke-linecap="round" opacity=".7"/><ellipse cx="112" cy="152" rx="80" ry="12" fill="#C9B79F"/><path d="M166 80h10c16 0 16 36 0 36h-12" fill="none" stroke="#F6F1EA" stroke-width="9"/><path d="M56 66h112v40c0 28-22 44-56 44s-56-16-56-44z" fill="#F6F1EA"/><ellipse cx="112" cy="66" rx="56" ry="10" fill="#6B4A35"/><path d="M112 72c-5-7-14-2-9 4l9 5 9-5c5-6-4-11-9-4z" fill="#E9DFD0"/></svg>`,
  arch:`<svg class="s-ill s-arch" viewBox="0 0 160 170" aria-hidden="true"><path d="M0 170V80a80 80 0 0 1 160 0v90z" class="fa"/><g fill="none" class="so" stroke-width="6"><circle cx="60" cy="130" r="14"/><circle cx="100" cy="130" r="14"/><path d="M68 118l44-70M92 118L48 48"/></g><path d="M118 52h20M118 64h20M118 76h20M118 88h20" class="sl" stroke-width="4"/></svg>`,
  pipe:`<svg class="s-ill" viewBox="0 0 220 170" aria-hidden="true"><path class="fl" d="M16 40h96v34h58v80h-32v-48H80V72H16z"/><rect class="fa" x="104" y="32" width="14" height="50"/><rect class="fa" x="132" y="96" width="44" height="14"/><path fill="#3B82C4" d="M154 120s-14 18-14 28a14 14 0 0 0 28 0c0-10-14-28-14-28z"/><path d="M34 140l46-46" class="sx" stroke-width="13"/><path d="M78 84l10-10 14 4 4 14-10 10-6-12z" class="fx"/></svg>`
};
// Café "Instagram" strip: five tiny square photos, drawn
const CAFE_PICS=[
  `<rect width="100" height="100" fill="#6B4A35"/><circle cx="50" cy="50" r="30" fill="#C9A27E"/><path d="M50 62c-10-12-24-4-16 6l16 10 16-10c8-10-6-18-16-6z" fill="#F6F1EA"/>`,
  `<rect width="100" height="100" fill="#E9DFD0"/><path d="M50 50m-4 0a4 4 0 1 1 8 0a10 10 0 1 1-18 0a16 16 0 1 1 30 0a22 22 0 1 1-42 0" fill="none" stroke="#A86B3C" stroke-width="7"/>`,
  `<rect width="100" height="100" fill="#7C8B6F"/><rect x="22" y="14" width="56" height="70" fill="#DDE3D3"/><path d="M50 14v70M22 49h56" stroke="#7C8B6F" stroke-width="4"/><rect x="30" y="76" width="16" height="16" fill="#A86B3C"/><path d="M38 76c-8-14 4-20 0-30M38 76c8-12 14-6 14-16" stroke="#3E5A34" stroke-width="4" fill="none"/>`,
  `<rect width="100" height="100" fill="#2A211B"/><path d="M14 64c10-26 62-26 72 0-12-6-20-4-24 4-6-8-18-8-24 0-4-8-12-10-24-4z" fill="#D9A35B"/><path d="M38 44l4 20M50 40v24M62 44l-4 20" stroke="#A86B3C" stroke-width="3"/>`,
  `<rect width="100" height="100" fill="#F6F1EA"/><rect x="18" y="58" width="30" height="26" fill="#6B4A35"/><rect x="52" y="52" width="30" height="32" fill="#C9B79F"/><rect x="34" y="28" width="30" height="24" fill="#7C8B6F"/>`
];

// ---- Per-type state (kept while the visitor switches types, so nothing they clicked is lost) ----
const S={
  burger:{tab:0,cart:{},done:null},
  cafe:{day:0,time:null,ppl:2,done:false},
  hair:{svc:null,sty:0,day:null,slot:null,done:false},
  plumber:{job:null,urg:0,day:null,slot:null,done:false,qdone:false,call:false,f:{}},
  shop:{view:0,scent:0,size:0,qty:1,cart:[],drawer:null,pay:0,f:{}}
};

// ---- 1. Burger joint ----
const BG_TABS=[['Burgerit','Burgers'],['Lisukkeet','Sides'],['Juomat','Drinks']];
const BG_MENU=[
  [['Klassikko','Classic',13.9,'Naudanlihapihvi, cheddar, suolakurkku ja talon kastike','Beef patty, cheddar, pickles and house sauce'],
   ['Savupommi','Smoke Bomb',15.5,'Tuplapihvi, savupekoni ja BBQ-kastike','Double patty, smoked bacon and BBQ sauce'],
   ['Halloumi','Halloumi',13.5,'Grillattu halloumi, paahdettu paprika ja rucola','Grilled halloumi, roasted pepper and rocket'],
   ['Chili','Chili',14.5,'Jalapeño, pepper jack ja chilimajoneesi','Jalapeño, pepper jack and chilli mayo']],
  [['Ranskalaiset','Fries',4.5,'Merisuolalla','With sea salt'],
   ['Bataattiranskalaiset','Sweet potato fries',5.5,'Valkosipulimajoneesin kanssa','With garlic mayo'],
   ['Sipulirenkaat','Onion rings',5,'Oluttaikinassa','In beer batter']],
  [['Kotitekoinen limonadi','Homemade lemonade',3.9,'Sitruuna ja minttu','Lemon and mint'],
   ['Pirtelö','Milkshake',5.9,'Vanilja, suklaa tai mansikka','Vanilla, chocolate or strawberry'],
   ['Kivennäisvesi','Sparkling water',2.9,'0,5 l','0.5 l']]
];
const BG_HRS=[[[1,2,3,4],'ma–to','Mon–Thu','11–21','11:00–21:00'],[[5,6],'pe–la','Fri–Sat','11–23','11:00–23:00'],[[0],'su','Sun','12–20','12:00–20:00']];
function bgCart(){
  let n=0,sum=0;
  for(const k in S.burger.cart){ const [t,i]=k.split('-'),q=S.burger.cart[k]; n+=q; sum+=q*BG_MENU[t][i][2]; }
  return [n,sum];
}
function bgPickup(){
  const d=new Date(Date.now()+25*6e4);
  let h=d.getHours(),m=Math.ceil(d.getMinutes()/5)*5;
  if(m===60){ m=0; h=(h+1)%24; }
  return clk(h,m);
}
function tplBurger(){
  const s=S.burger,[n,sum]=bgCart(),th=todayHours(BG_HRS);
  const items=n===1?L('1 tuote','1 item'):n+L(' tuotetta',' items');
  return snav([['menu','Menu'],['visit',L('Löydä meille','Find us')]],btn('go','menu',L('Tilaa','Order'),'s-sm'))+
  `<div class="s-hero"><div>
    <p class="s-big">${N()}</p>
    <p class="s-lead">${L('Savustettua, mehukasta ja aina tuoreista aineksista. Syö paikan päällä tai tilaa noudettavaksi.','Smoked, juicy and always made from fresh ingredients. Eat in or order for pickup.')}</p>
    <p class="s-tags"><span>${th?L('Avoinna tänään ','Open today ')+th:L('Suljettu tänään','Closed today')}</span><span>Demokatu 12, Helsinki</span></p>
    ${btn('go','menu',L('Tilaa noudettavaksi','Order for pickup'))}
  </div>${SVG.burger}</div>
  <div class="s-sec" data-sec="menu">
    <p class="s-h">Menu</p>
    <div class="s-chips">${BG_TABS.map((t,i)=>chip('tab',i,s.tab===i,L(t[0],t[1]))).join('')}</div>
    <ul class="s-menu">${BG_MENU[s.tab].map((m,i)=>{const q=s.cart[s.tab+'-'+i]||0;return `<li><div><b>${L(m[0],m[1])}</b><span>${L(m[3],m[4])}</span></div><span class="s-pr">${eur(m[2])}</span><button type="button" class="s-add" data-a="add" data-v="${s.tab}-${i}" aria-label="${L('Lisää tilaukseen: ','Add to order: ')+L(m[0],m[1])}">+${q?`<span class="s-q">${q}</span>`:''}</button></li>`;}).join('')}</ul>
    ${s.done?done(L('Tilauksesi on noudettavissa noin klo ','Your order will be ready for pickup at about ')+s.done+L(' osoitteesta Demokatu 12. Maksu noudettaessa.',' at Demokatu 12. Pay when you collect.'),'reset')
      :`<p class="s-demo">${L('Lisää tuotteita +-painikkeilla ja tilaa noudettavaksi.','Add items with the + buttons and order for pickup.')}</p>`}
  </div>
  ${visit(BG_HRS)}${sfoot()}
  ${n&&!s.done?`<div class="s-bar"><span>${items} · <b>${eur(sum)}</b></span>${btn('order',null,L('Tilaa noudettavaksi','Order for pickup'))}</div>`:''}`;
}

// ---- 2. Café ----
const CF_HRS=[[[1,2,3,4,5],'ma–pe','Mon–Fri','7.30–18','7:30–18:00'],[[6],'la','Sat','9–17','9:00–17:00'],[[0],'su','Sun','10–16','10:00–16:00']];
const CF_MENU=[
  [['Kahvit','Coffee'],[['Espresso','Espresso',3.2],['Cappuccino','Cappuccino',4.5],['Kaurajuomalatte','Oat latte',4.9]]],
  [['Leivonnaiset','Pastries'],[['Korvapuusti','Cinnamon bun',3.9],['Mustikkapiirakka','Bilberry pie',4.5],['Voicroissant','Butter croissant',3.6]]],
  [['Lounas ma–pe 11–14','Lunch Mon–Fri 11–14'],[['Päivän keitto ja leipä','Soup of the day with bread',11.5],['Lämmin savulohileipä','Warm smoked salmon sandwich',12.9],['Halloumisalaatti','Halloumi salad',12.5]]]
];
const CF_TIMES=[[9,0],[10,30],[12,0],[13,30],[15,0]];
function tplCafe(){
  const s=S.cafe,days=skDays(4,0,false),now=new Date();
  const dayLab=(d,i)=>i===0?L('Tänään','Today'):i===1?L('Huomenna','Tomorrow'):dl(d);
  const dayLow=i=>i<2?dayLab(days[i],i).toLowerCase():dl(days[i]);
  const past=(i,t)=>i===0&&(t[0]*60+t[1])<=now.getHours()*60+now.getMinutes()+30;
  const ready=s.time!=null;
  return snav([['menu','Menu'],['book',L('Varaa pöytä','Book a table')],['visit',L('Yhteystiedot','Contact')]])+
  `<div class="s-hero"><div>
    <p class="s-eyebrow">${N()}</p>
    <p class="s-h1">${L('Hidas aamu, hyvä kahvi.','Slow mornings, good coffee.')}</p>
    <p class="s-lead">${L('Paahdamme pienissä erissä ja leivomme joka aamu. Lounas arkisin 11–14.','Roasted in small batches, baked every morning. Lunch on weekdays 11–14.')}</p>
    <div class="s-ctas">${btn('go','book',L('Varaa pöytä','Book a table'))}${btn('go','menu','Menu','ghost')}</div>
  </div>${SVG.cup}</div>
  <div class="s-sec s-cafehrs">${hours(CF_HRS)}</div>
  <div class="s-sec" data-sec="menu"><p class="s-h">Menu</p><div class="s-cols">${CF_MENU.map(c=>`<div><p class="s-step">${L(c[0][0],c[0][1])}</p><ul class="s-list">${c[1].map(m=>`<li><span>${L(m[0],m[1])}</span><span class="s-pr">${eur(m[2])}</span></li>`).join('')}</ul></div>`).join('')}</div></div>
  <div class="s-sec" data-sec="book"><div class="s-book">
    <p class="s-h">${L('Varaa pöytä','Book a table')}</p>
    ${s.done?done(L(`Pöytä ${s.ppl} hengelle ${dayLow(s.day)} klo ${clk(...CF_TIMES[s.time])}. Pidämme pöytää 15 minuuttia.`,`A table for ${s.ppl}, ${dayLow(s.day)} at ${clk(...CF_TIMES[s.time])}. We hold it for 15 minutes.`),'reset'):
    `<p class="s-step">${L('Päivä','Day')}</p><div class="s-chips">${days.map((d,i)=>chip('day',i,s.day===i,dayLab(d,i))).join('')}</div>
    <p class="s-step">${L('Aika','Time')}</p><div class="s-chips">${CF_TIMES.map((t,i)=>chip('time',i,s.time===i,clk(...t),past(s.day,t)||(s.day+i)%4===3)).join('')}</div>
    <p class="s-step">${L('Henkilöitä','Guests')}</p>
    <div class="s-stepper"><button type="button" data-a="ppl" data-v="-1" aria-label="${L('Vähemmän','Fewer')}"${s.ppl<2?' disabled':''}>−</button><output aria-live="polite">${s.ppl}</output><button type="button" data-a="ppl" data-v="1" aria-label="${L('Enemmän','More')}"${s.ppl>7?' disabled':''}>+</button></div>
    ${btn('book',null,ready?L('Varaa pöytä','Book the table')+' · '+clk(...CF_TIMES[s.time]):L('Valitse aika','Pick a time'),'s-wide',!ready)}
    <p class="s-demo">${L('Juhlat tai catering yli 20 hengelle: ','Parties or catering for 20+: ')+MAIL()}</p>`}
  </div></div>
  <div class="s-sec"><p class="s-h">${L('Kuvia kahvilasta','From the café')}</p><p class="s-handle">@${SLUG().replace(/\.fi$/,'').replace(/-/g,'')}</p><div class="s-strip">${CAFE_PICS.map(p=>`<svg viewBox="0 0 100 100" aria-hidden="true">${p}</svg>`).join('')}</div></div>
  ${visit(CF_HRS)}${sfoot()}`;
}

// ---- 3. Hair salon: booking first ----
const HR_SVC=[['Hiustenleikkaus','Haircut',45,52],['Leikkaus ja väri','Cut and colour',120,135],['Parturileikkaus','Barber cut',30,35],['Juhlakampaus','Updo',60,72]];
const HR_STY=[['Aino','värit ja vaalennukset','colour and blonding','#7B2E55'],['Mira','leikkaukset ja kiharat hiukset','cuts and curly hair','#A2577A'],['Joel','parturityöt ja parrat','barbering and beards','#3D2230']];
const HR_SLOT=[[9,0],[10,30],[12,0],[13,30],[15,0],[16,30]];
const HR_HRS=[[[2,3,4,5],'ti–pe','Tue–Fri','10–19','10:00–19:00'],[[6],'la','Sat','9–15','9:00–15:00'],[[0,1],'su–ma','Sun–Mon','suljettu','closed']];
function tplHair(){
  const s=S.hair,days=skDays(5,1,true);
  const taken=(di,si)=>((di+1)*(si+2)+s.sty)%5===0;
  const ready=s.svc!=null&&s.day!=null&&s.slot!=null;
  const sty=s.sty?L('kampaaja ','with ')+HR_STY[s.sty-1][0]:L('ensimmäinen vapaa kampaaja','first free stylist');
  const book=s.done?done(L(`Varaus vahvistettu: ${HR_SVC[s.svc][0].toLowerCase()}, ${dl(days[s.day])} klo ${clk(...HR_SLOT[s.slot])} (${sty}). Vahvistus lähtisi sähköpostiisi.`,`Booked: ${HR_SVC[s.svc][1].toLowerCase()}, ${dl(days[s.day])} at ${clk(...HR_SLOT[s.slot])} (${sty}). A confirmation would go to your email.`),'reset'):
    `<p class="s-step">1 · ${L('Palvelu','Service')}</p><div class="s-chips">${HR_SVC.map((x,i)=>chip('svc',i,s.svc===i,`${L(x[0],x[1])}<small>${x[2]} min · ${eur0(x[3])}</small>`)).join('')}</div>
    <p class="s-step">2 · ${L('Kampaaja','Stylist')}</p><div class="s-chips">${chip('sty',0,s.sty===0,L('Kuka tahansa','Anyone'))}${HR_STY.map((x,i)=>chip('sty',i+1,s.sty===i+1,x[0])).join('')}</div>
    <p class="s-step">3 · ${L('Päivä','Day')}</p><div class="s-chips">${days.map((d,i)=>chip('day',i,s.day===i,dl(d))).join('')}</div>
    <p class="s-step">4 · ${L('Aika','Time')}</p>${s.day==null?`<p class="s-demo">${L('Valitse ensin päivä.','Pick a day first.')}</p>`:`<div class="s-chips">${HR_SLOT.map((t,i)=>chip('slot',i,s.slot===i,clk(...t),taken(s.day,i))).join('')}</div>`}
    ${btn('book',null,ready?L('Vahvista varaus','Confirm booking')+' · '+eur0(HR_SVC[s.svc][3]):L('Valitse palvelu ja aika','Pick a service and time'),'s-wide',!ready)}`;
  return snav([['svc',L('Palvelut','Services')],['team',L('Kampaajat','Stylists')],['visit',L('Yhteystiedot','Contact')]],btn('go','book',L('Varaa aika','Book'),'s-sm'))+
  `<div class="s-hero"><div>
    <p class="s-eyebrow">${N()}</p>
    <p class="s-h1">${L('Hiukset, joista tulee hyvä mieli.','Hair that makes your day.')}</p>
    <p class="s-lead">${L('Leikkaukset, värit ja kampaukset Helsingin keskustassa. Varaa aika verkossa minuutissa.','Cuts, colour and styling in central Helsinki. Book online in a minute.')}</p>
    ${SVG.arch}
  </div><div class="s-book" data-sec="book"><p class="s-h">${L('Varaa aika','Book a time')}</p>${book}</div></div>
  <div class="s-sec" data-sec="svc"><p class="s-h">${L('Palvelut ja hinnat','Services and prices')}</p><ul class="s-svc">${HR_SVC.map(x=>`<li><b>${L(x[0],x[1])}</b><span>${x[2]} min</span><span class="s-pr">${eur0(x[3])}</span></li>`).join('')}</ul></div>
  <div class="s-sec" data-sec="team"><p class="s-h">${L('Kampaajat','Our stylists')}</p><div class="s-team">${HR_STY.map((x,i)=>`<div><span class="s-mono m${i}" aria-hidden="true">${x[0][0]}</span><b>${x[0]}</b><span>${L(x[1],x[2])}</span>${btn('pick',i+1,L('Varaa: ','Book ')+x[0],'ghost s-sm')}</div>`).join('')}</div></div>
  ${visit(HR_HRS)}${sfoot()}`;
}

// ---- 4. Plumber: booking first, emergency line always in reach ----
const PL_JOB=[['Vuotava hana','Dripping tap'],['Tukkeutunut viemäri','Blocked drain'],['Hanan tai WC:n asennus','Tap or toilet install'],['Jokin muu','Something else']];
const PL_SLOT=['8–10','10–12','12–14','14–16'];
const PL_SVC=[['Vuotojen korjaus','Leak repairs','Hanat, putket ja liitokset.','Taps, pipes and joints.'],['Viemärin avaus','Drain clearing','Myös kuvaus ja huuhtelu.','Camera checks and flushing too.'],['Asennukset','Installations','Hanat, WC:t ja astianpesukoneet.','Taps, toilets and dishwashers.'],['Lämminvesivaraajat','Water heaters','Vaihto ja huolto.','Replacement and servicing.'],['Kylpyhuoneet','Bathrooms','LVI-työt remontin osana.','Plumbing for renovations.'],['Vesimittarit','Water meters','Vaihto taloyhtiöille.','Replacement for housing companies.']];
function tplPlumber(){
  const s=S.plumber,days=skDays(5,1,true),f=s.f;
  const ready=s.job!=null&&s.day!=null&&s.slot!=null;
  const callNote=s.call?`<p class="s-note" role="status">${L('Demo: oikealla sivulla tästä soitettaisiin päivystysnumeroon.','Demo: on a real site this would call the 24/7 line.')}</p>`:'';
  const sos=(cls)=>btn('call',null,L('Päivystys 24/7','24/7 emergency'),'s-sos-btn '+cls);
  const book=s.done?done(L(`Käynti varattu: ${PL_JOB[s.job][0].toLowerCase()}, ${dl(days[s.day])} klo ${PL_SLOT[s.slot]}. Asentaja soittaa puoli tuntia ennen tuloaan.`,`Visit booked: ${PL_JOB[s.job][1].toLowerCase()}, ${dl(days[s.day])} at ${PL_SLOT[s.slot]}. The plumber calls half an hour before arriving.`),'reset'):
    `<p class="s-step">1 · ${L('Mikä vikana?','What needs fixing?')}</p><div class="s-chips">${PL_JOB.map((x,i)=>chip('job',i,s.job===i,L(x[0],x[1]))).join('')}</div>
    <p class="s-step">2 · ${L('Kiire','Urgency')}</p><div class="s-chips">${chip('urg',0,s.urg===0,L('Normaali','Standard'))}${chip('urg',1,s.urg===1,L('Kiireellinen, 24 h','Urgent, 24 h'))}</div>
    ${s.urg?`<p class="s-note">${L('Jos vettä valuu nyt, sulje päävesihana ja soita päivystykseen.','If water is leaking right now, shut the main valve and call the emergency line.')}</p>`:''}
    <p class="s-step">3 · ${L('Päivä','Day')}</p><div class="s-chips">${days.map((d,i)=>chip('day',i,s.day===i,dl(d))).join('')}</div>
    <p class="s-step">4 · ${L('Aikaikkuna','Time window')}</p><div class="s-chips">${PL_SLOT.map((t,i)=>chip('slot',i,s.slot===i,t,s.day!=null&&(s.day+i)%3===2)).join('')}</div>
    ${btn('book',null,ready?L('Varaa käynti','Book the visit'):L('Valitse työ ja aika','Pick a job and time'),'s-wide',!ready)}`;
  return snav([['svc',L('Palvelut','Services')],['area',L('Alue','Area')],['quote',L('Tarjous','Quote')]],sos('s-wideonly'))+callNote+
  `<div class="s-hero"><div>
    <p class="s-eyebrow">${N()}</p>
    <p class="s-h1">${L('Vuotava hana vai tukkoinen viemäri? Tulemme nopeasti.','Dripping tap or blocked drain? We come fast.')}</p>
    <p class="s-lead">${L('LVI-työt kotitalouksille ja taloyhtiöille. Kerromme hinta-arvion ennen kuin työ alkaa.','Plumbing for homes and housing companies. You get a price estimate before any work starts.')}</p>
    ${SVG.pipe}
  </div><div class="s-book" data-sec="book"><p class="s-h">${L('Varaa käynti','Book a visit')}</p>${book}</div></div>
  <div class="s-sec" data-sec="svc"><p class="s-h">${L('Palvelut','Services')}</p><div class="s-svcgrid">${PL_SVC.map(x=>`<div><b>${L(x[0],x[1])}</b><span>${L(x[2],x[3])}</span></div>`).join('')}</div></div>
  <div class="s-sec s-two" data-sec="area"><div><p class="s-h">${L('Toiminta-alue','Where we work')}</p><p>${L('Helsinki, Espoo, Vantaa ja Kauniainen. Muualle Uudellemaalle sopimuksen mukaan.','Helsinki, Espoo, Vantaa and Kauniainen. Elsewhere in Uusimaa by arrangement.')}</p></div>${MAP}</div>
  <div class="s-sec" data-sec="quote"><div class="s-book"><p class="s-h">${L('Pyydä tarjous','Ask for a quote')}</p>
    ${s.qdone?done(L('Palaamme tarjouksen kanssa yhden arkipäivän kuluessa.','We will come back with a quote within one business day.'),'qreset'):
    field('d',L('Kuvaile työ','Describe the job'),1)+`<div class="s-two s-tight">${field('z',L('Postinumero','Postcode'))}${field('c',L('Puhelin tai sähköposti','Phone or email'))}</div>`+btn('quote',null,L('Lähetä tarjouspyyntö','Send the request'),'s-wide')}
  </div></div>
  ${sfoot()}
  <div class="s-sos"><span>${L('Päivystys 24/7','24/7 emergency')}<b>040 000 0000</b></span>${btn('call',null,L('Soita','Call'),'s-sos-btn')}</div>`;
}

// ---- 5. Small online shop: one hero product, cart drawer, checkout ----
const SH_SCENT=[['Kuusenkerkkä','Spruce tip','#4E7A5A'],['Mustikka','Bilberry','#5B4B8A'],['Meri','Sea breeze','#3C6E8F']];
const SH_SIZE=[['180 g',24,40],['320 g',36,70]];
const SH_PAY=[['Kortti','Card'],['MobilePay','MobilePay'],['Verkkopankki','Online bank']];
function candle(c,v){
  const jar=`<rect x="62" y="74" width="76" height="96" fill="${c}"/><rect x="74" y="108" width="52" height="30" fill="#F8F6F1"/><rect x="82" y="116" width="36" height="4" fill="#1F2421"/><rect x="88" y="125" width="24" height="3" fill="#1F2421"/>`;
  const art=v===0?jar+`<rect x="58" y="62" width="84" height="14" fill="#1F2421"/>`
    :v===1?jar+`<rect x="62" y="74" width="76" height="8" fill="#EFE6D2"/><path d="M100 40c9 11 11 20 0 30-11-10-9-19 0-30z" fill="#C9773B"/><rect x="98" y="66" width="4" height="10" fill="#1F2421"/>`
    :`<rect x="48" y="84" width="104" height="86" fill="#2F5D4A"/><rect x="94" y="84" width="12" height="86" fill="#C9773B"/><rect x="48" y="118" width="104" height="12" fill="#C9773B"/><path d="M100 84c-14-18-30-6-14 0zm0 0c14-18 30-6 14 0z" fill="#C9773B"/>`;
  return `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#E3EBE5"/><rect y="170" width="200" height="30" fill="#D3DED6"/>${art}</svg>`;
}
function shTotals(){
  const sub=S.shop.cart.reduce((a,x)=>a+x.q*SH_SIZE[x.z][1],0);
  const ship=sub>=50||!sub?0:5.9;
  return [sub,ship,sub+ship];
}
function tplShop(){
  const s=S.shop,n=s.cart.reduce((a,x)=>a+x.q,0),sz=SH_SIZE[s.size],sc=SH_SCENT[s.scent];
  return `<div class="s-ann">${L('Ilmainen toimitus yli 50 € tilauksiin','Free delivery on orders over €50')}</div>`+
  snav([['buy',L('Kynttilät','Candles')],['ship',L('Toimitus','Delivery')],['faq','UKK']],`<button type="button" class="s-cartbtn" data-a="open">${L('Ostoskori','Cart')} (${n})</button>`)+
  `<div class="s-pdp" data-sec="buy">
    <div class="s-gal"><div class="s-main">${candle(sc[2],s.view)}</div><div class="s-thumbs">${[0,1,2].map(v=>`<button type="button" data-a="view" data-v="${v}" aria-pressed="${s.view===v}" aria-label="${L('Kuva ','Photo ')+(v+1)}/3">${candle(sc[2],v)}</button>`).join('')}</div></div>
    <div>
      <p class="s-eyebrow">${N()}</p>
      <p class="s-h1">${L('Tuoksukynttilä, käsin valettu','Hand-poured scented candle')}</p>
      <p class="s-price">${eur(sz[1])}</p>
      <p class="s-step">${L('Tuoksu','Scent')}: ${L(sc[0],sc[1])}</p><div class="s-chips">${SH_SCENT.map((x,i)=>chip('scent',i,s.scent===i,`<i class="s-sw" style="background:${x[2]}"></i>${L(x[0],x[1])}`)).join('')}</div>
      <p class="s-step">${L('Koko','Size')}</p><div class="s-chips">${SH_SIZE.map((x,i)=>chip('size',i,s.size===i,x[0])).join('')}</div>
      <div class="s-buy"><div class="s-stepper"><button type="button" data-a="qty" data-v="-1" aria-label="${L('Vähemmän','Fewer')}"${s.qty<2?' disabled':''}>−</button><output aria-live="polite">${s.qty}</output><button type="button" data-a="qty" data-v="1" aria-label="${L('Enemmän','More')}"${s.qty>8?' disabled':''}>+</button></div>${btn('addcart',null,L('Lisää ostoskoriin','Add to cart'))}</div>
      <ul class="s-usp"><li>${L('Soijavaha ja puuvillasydän','Soy wax and a cotton wick')}</li><li>${L('Paloaika noin ','Burns for about ')+sz[2]+L(' tuntia',' hours')}</li><li>${L('Lähetetään 1–2 arkipäivässä','Ships in 1–2 business days')}</li></ul>
    </div>
  </div>
  <div class="s-sec" data-sec="ship"><p class="s-h">${L('Toimitus ja palautus','Delivery and returns')}</p><p>${L('Toimitus noutopisteeseen 5,90 €, yli 50 € tilauksiin ilmainen. Palautusoikeus 14 päivää.','Delivery to a pickup point €5.90, free on orders over €50. 14-day right of return.')}</p></div>
  <div class="s-sec s-faq" data-sec="faq"><p class="s-h">${L('Usein kysyttyä','Questions')}</p>
    <details><summary>${L('Kuinka kauan kynttilä palaa?','How long does a candle burn?')}</summary><p>${L('180 g noin 40 tuntia ja 320 g noin 70 tuntia. Leikkaa sydän lyhyeksi ennen sytyttämistä.','The 180 g about 40 hours and the 320 g about 70. Trim the wick before lighting.')}</p></details>
    <details><summary>${L('Saako lahjapaketin?','Can I get it gift-wrapped?')}</summary><p>${L('Jokainen kynttilä lähtee lahjarasiassa ilman lisähintaa.','Every candle ships in a gift box at no extra cost.')}</p></details>
    <details><summary>${L('Mistä tilaus lähtee?','Where do orders ship from?')}</summary><p>${L('Helsingistä, yleensä seuraavana arkipäivänä.','From Helsinki, usually the next business day.')}</p></details>
  </div>
  ${sfoot()}`;
}
function shDrawer(){
  const s=S.shop,[sub,ship,tot]=shTotals();
  if(!s.drawer) return '';
  let head,body,foot='';
  if(s.drawer==='done'){
    head=L('Tilaus vastaanotettu','Order received');
    body=done(L('Tilausvahvistus lähtisi sähköpostiisi ja paketti noutopisteeseen 1–2 arkipäivässä.','A confirmation would go to your email and the parcel to a pickup point in 1–2 business days.'),'fresh');
  }else if(!s.cart.length){
    head=L('Ostoskori','Cart');
    body=`<p class="s-demo">${L('Ostoskori on tyhjä.','Your cart is empty.')}</p>`;
  }else{
    const sum=`<div class="s-sum"><div><span>${L('Välisumma','Subtotal')}</span><span>${eur(sub)}</span></div><div><span>${L('Toimitus','Delivery')}</span><span>${ship?eur(ship):L('Ilmainen','Free')}</span></div><div class="tot"><span>${L('Yhteensä','Total')}</span><span>${eur(tot)}</span></div><small>${L('Sis. alv 25,5 %','Incl. VAT 25.5%')}</small></div>`;
    if(s.drawer==='cart'){
      head=L('Ostoskori','Cart');
      body=s.cart.map((x,i)=>`<div class="s-line">${candle(SH_SCENT[x.s][2],0)}<div><b>${L(SH_SCENT[x.s][0],SH_SCENT[x.s][1])}</b><span>${SH_SIZE[x.z][0]} · ${x.q} ${L('kpl','pcs')}</span><button type="button" class="s-rm" data-a="rm" data-v="${i}">${L('Poista','Remove')}</button></div><span class="s-pr">${eur(x.q*SH_SIZE[x.z][1])}</span></div>`).join('');
      foot=sum+btn('checkout',null,L('Kassalle','Checkout'),'s-wide');
    }else{
      head=L('Kassa','Checkout');
      body=`<p class="s-payee">${L('Maksunsaaja','Paying')}: <b>${N()}</b></p>${field('e',L('Sähköposti','Email'))}<p class="s-step">${L('Maksutapa','Payment')}</p><div class="s-chips">${SH_PAY.map((x,i)=>chip('pay',i,s.pay===i,L(x[0],x[1]))).join('')}</div><p class="s-demo">${L('Demo: maksua ei veloiteta.','Demo: nothing is charged.')}</p>`;
      foot=sum+btn('paynow',null,L('Maksa ','Pay ')+eur(tot),'s-wide');
    }
  }
  return `<div class="s-scrim" data-a="close"></div><div class="s-drawer" role="dialog" aria-modal="true" aria-label="${head}"><div class="s-dhead"><p class="s-h" tabindex="-1" data-focus>${head}</p><button type="button" class="s-x" data-a="close" aria-label="${L('Sulje','Close')}"></button></div><div class="s-dbody">${body}</div>${foot?`<div class="s-dfoot">${foot}</div>`:''}</div>`;
}

const TPL={burger:tplBurger,cafe:tplCafe,hair:tplHair,plumber:tplPlumber,shop:tplShop};

// ---- What each click does (data-a / data-v on the clicked element) ----
const clampN=(v,a,b)=>Math.min(b,Math.max(a,v));
const ACT={
  burger:{tab:v=>{S.burger.tab=+v;},add:v=>{const c=S.burger.cart;c[v]=(c[v]||0)+1;},order:()=>{S.burger.done=bgPickup();return 1;},reset:()=>{S.burger.cart={};S.burger.done=null;}},
  cafe:{day:v=>{S.cafe.day=+v;S.cafe.time=null;},time:v=>{S.cafe.time=+v;},ppl:v=>{S.cafe.ppl=clampN(S.cafe.ppl+ +v,1,8);},book:()=>{S.cafe.done=true;return 1;},reset:()=>{S.cafe.time=null;S.cafe.done=false;}},
  hair:{svc:v=>{S.hair.svc=+v;},sty:v=>{S.hair.sty=+v;S.hair.slot=null;},day:v=>{S.hair.day=+v;S.hair.slot=null;},slot:v=>{S.hair.slot=+v;},
    pick:v=>{S.hair.sty=+v;S.hair.slot=null;S.hair.done=false;return 'book';},book:()=>{S.hair.done=true;return 1;},reset:()=>{Object.assign(S.hair,{svc:null,day:null,slot:null,done:false});}},
  plumber:{job:v=>{S.plumber.job=+v;},urg:v=>{S.plumber.urg=+v;},day:v=>{S.plumber.day=+v;S.plumber.slot=null;},slot:v=>{S.plumber.slot=+v;},call:()=>{S.plumber.call=!S.plumber.call;},
    book:()=>{S.plumber.done=true;return 1;},reset:()=>{Object.assign(S.plumber,{job:null,day:null,slot:null,done:false});},quote:()=>{S.plumber.qdone=true;return 1;},qreset:()=>{S.plumber.qdone=false;S.plumber.f={};}},
  shop:{view:v=>{S.shop.view=+v;},scent:v=>{S.shop.scent=+v;},size:v=>{S.shop.size=+v;},qty:v=>{S.shop.qty=clampN(S.shop.qty+ +v,1,9);},
    addcart:()=>{const s=S.shop,hit=s.cart.find(x=>x.s===s.scent&&x.z===s.size);if(hit)hit.q=Math.min(9,hit.q+s.qty);else s.cart.push({s:s.scent,z:s.size,q:s.qty});s.drawer='cart';return 1;},
    open:()=>{S.shop.drawer='cart';return 1;},close:()=>{S.shop.drawer=null;return 2;},rm:v=>{S.shop.cart.splice(+v,1);return 1;},
    checkout:()=>{S.shop.drawer='pay';return 1;},pay:v=>{S.shop.pay=+v;},paynow:()=>{S.shop.drawer='done';S.shop.cart=[];return 1;},fresh:()=>{S.shop.drawer=null;S.shop.f={};return 2;}}
};

// ---- Rendering ----
const skReduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function skGo(sec){
  const sc=skEl('skScroll'),el=sc.querySelector('[data-sec="'+sec+'"]');
  if(el) sc.scrollTo({top:el.offsetTop-8,behavior:skReduce()?'auto':'smooth'});
}
function renderSketch(){
  const name=N(),sc=skEl('skScroll'),top=sc.scrollTop;
  skEl('skMock').dataset.t=skT;
  skPaint();
  skEl('skSite').innerHTML=TPL[skT]();
  skEl('skLayer').innerHTML=skT==='shop'?shDrawer():'';
  sc.scrollTop=top;
  skEl('skTab').innerHTML=name+' — '+L(...SK_TITLE[skT]);
  skEl('skUrl').textContent=SLUG();
  skEl('skName').placeholder=SK_NAME[skT][lang==='fi'?0:1];
  sc.setAttribute('aria-label',L('Esimerkkisivu: ','Example site: ')+skEl('skTab').textContent);
}
// Switching type or scheme: a quick fade so the new look arrives rather than jumps (a scheme change keeps the scroll spot)
function skSwap(keep){
  const sc=skEl('skScroll');
  if(skReduce()){ renderSketch(); if(!keep) sc.scrollTop=0; return; }
  sc.classList.remove('in'); sc.classList.add('out');
  clearTimeout(skSwap.t);
  skSwap.t=setTimeout(()=>{ renderSketch(); if(!keep) sc.scrollTop=0; sc.classList.remove('out'); void sc.offsetWidth; sc.classList.add('in'); },150);
}

skEl('skView').addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');
  if(!b||b.disabled) return;
  const a=b.dataset.a,v=b.dataset.v;
  if(a==='go'){ skGo(v); return; }
  const fn=ACT[skT][a]; if(!fn) return;
  const focusKey=b.matches('button')?'[data-a="'+a+'"]'+(v!=null?'[data-v="'+v+'"]':''):null;
  const r=fn(v);
  renderSketch();
  if(typeof r==='string'){ skGo(r); return; }
  // Keep keyboard focus where it was; after a booking, an order or a drawer opening, move it to the new heading
  const view=skEl('skView');
  let t=r===1?view.querySelector('[data-focus]'):r===2?view.querySelector('[data-a="open"]'):null;
  if(!t&&focusKey){ t=view.querySelector(focusKey); if(t&&t.disabled) t=null; }
  if(!t) return;
  // Move focus without scrolling the page; bring a new confirmation into view inside the mockup only
  t.focus({preventScroll:true});
  const sc=skEl('skScroll');
  if(r===1&&sc.contains(t)){
    const y=t.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-80;
    if(y<sc.scrollTop||y>sc.scrollTop+sc.clientHeight-140) sc.scrollTo({top:y,behavior:skReduce()?'auto':'smooth'});
  }
});
skEl('skView').addEventListener('input',e=>{
  const k=e.target.dataset.f; if(k){ (S[skT].f=S[skT].f||{})[k]=e.target.value; }
});
skEl('skView').addEventListener('keydown',e=>{
  if(e.key==='Escape'&&skT==='shop'&&S.shop.drawer){ S.shop.drawer=null; renderSketch(); const o=skEl('skView').querySelector('[data-a="open"]'); if(o) o.focus(); }
});

// What the visitor typed follows them to the pricing page (this tab only), so the quote can say who it is for
function skSave(){
  try{ sessionStorage.setItem('wy-sketch',JSON.stringify({name:skName(),type:skT,scheme:skS})); }catch(e){}
}
skEl('skName').addEventListener('input',()=>{ renderSketch(); skSave(); });
document.querySelectorAll('input[name=skType]').forEach(r=>r.addEventListener('change',()=>{ skT=r.value; skSwap(); skSave(); }));
document.querySelectorAll('input[name=skScheme]').forEach(r=>r.addEventListener('change',()=>{ skS=r.value; skSwap(true); skSave(); }));

langHooks.push(function(l,first){
  if(first){
    try{
      const s=JSON.parse(sessionStorage.getItem('wy-sketch')||'{}');
      if(s.name) skEl('skName').value=String(s.name).slice(0,40);
      if(SK_NAME[s.type]){ skT=s.type; document.querySelector('input[name=skType][value='+s.type+']').checked=true; }
      if(SCH[s.scheme]) skS=s.scheme;
    }catch(e){}
    const c=document.querySelector('input[name=skType]:checked'); if(c) skT=c.value;
  }
  renderSketch();
});
})();
