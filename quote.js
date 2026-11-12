const skEl=id=>document.getElementById(id);
// ---- Quote machine: real package prices only ----

const QM={
  en:{title:'Your estimate',forWho:'for ',from:'from ',incl:'in the package',quoted:'quoted on the call',care:'Care plan',mo:'/month',total:'Website starting price',vat:'excl. VAT · with 25.5% VAT ≈ ',extraQ:'Extras on top of the Store package are quoted on the call.',
      up:l=>l+' requires Business. Your estimate is now from €1,390, up from €690.',down:'You chose Launch (from €690). We removed the Business-only features; extra languages stay as an add-on.',
      langs:n=>n===1?'1 extra language':n+' extra languages',
      live:(p,t)=>p+' package, '+t,x:{multi:'Multilingual site',blog:'Blog or news',ana:'SEO & analytics'},nfmt:n=>'€'+n.toLocaleString('en-US'),
      audit:{name:'Website audit',f:['Speed and loading','Basic security check','Privacy (GDPR and cookies)','Search visibility (SEO)','Prioritised fix list'],total:'Audit price',credit:'Credited in full if we fix the findings or build you a new site.'}},
  sv:{title:'Din uppskattning',forWho:'för ',from:'från ',incl:'ingår i paketet',quoted:'prissätts under samtalet',care:'Underhållspaket',mo:'/mån',total:'Webbplatsens startpris',vat:'exkl. moms · inkl. moms 25,5 % ≈ ',extraQ:'Tillägg utöver Webbutik-paketet prissätts under samtalet.',
      up:l=>l+' kräver paketet Företag. Startpriset ändrades från 690 € till 1 390 €.',down:'Du valde Start (från 690 €). Vi tog bort funktionerna som bara ingår i Företag; extra språk finns kvar som tillägg.',
      langs:n=>n===1?'1 extra språk':n+' extra språk',
      live:(p,t)=>'Paketet '+p+', '+t,x:{multi:'Flerspråkig webbplats',blog:'Blogg eller nyheter',ana:'SEO & analys'},nfmt:n=>n.toLocaleString('fi-FI')+' €',
      audit:{name:'Webbplatsgranskning',f:['Hastighet och laddning','Grundläggande säkerhetskontroll','Dataskydd (GDPR och kakor)','Synlighet i sökmotorer (SEO)','Åtgärdslista i prioritetsordning'],total:'Granskningens pris',credit:'Krediteras i sin helhet om vi åtgärdar fynden eller bygger en ny webbplats åt dig.'}},
  fi:{title:'Hinta-arviosi',forWho:'yritykselle ',from:'alk. ',incl:'paketissa',quoted:'hinnoitellaan puhelussa',care:'Ylläpitopaketti',mo:'/kk',total:'Sivuston lähtöhinta',vat:'alv 0 % · alv 25,5 % mukana ≈ ',extraQ:'Verkkokauppapaketin päälle tulevat lisät hinnoitellaan puhelussa.',
      up:l=>l+' edellyttää Yrityssivut-pakettia. Lähtöhinta vaihtui 690 eurosta 1 390 euroon.',down:'Valitsit Startti-paketin (alk. 690 €). Poistimme vain Yrityssivut-pakettiin kuuluvat ominaisuudet; lisäkielet säilyvät lisäpalveluna.',
      langs:n=>n===1?'1 lisäkieli':n+' lisäkieltä',
      live:(p,t)=>p+'-paketti, '+t,x:{multi:'Monikielinen sivusto',blog:'Blogi tai uutiset',ana:'SEO & analytiikka'},nfmt:n=>n.toLocaleString('fi-FI')+' €',
      audit:{name:'Sivustoauditointi',f:['Nopeus ja latausaika','Tietoturvan perustarkistus','Tietosuoja (GDPR ja evästeet)','Hakukonenäkyvyys (SEO)','Korjauslista tärkeysjärjestyksessä'],total:'Auditoinnin hinta',credit:'Hyvitetään kokonaan, jos korjaamme löydökset tai rakennamme uuden sivuston.'}}
};
const PRICE={launch:690,business:1390,store:2490,audit:390};
const PKG={launch:{name:'p1_t',f:['p1_f1','p1_f2','p1_f3','p1_f4']},business:{name:'p2_t',f:['p2_f1','p2_f2','p2_f3','p2_f4']},store:{name:'p3_t',f:['p3_f1','p3_f2','p3_f3','p3_f4','p3_f5']}};
const EXTRA_FEAT={multi:'p2_f2',blog:'p2_f3',ana:'p2_f4'};
const CARE=59,VAT=1.255,LANG_ADDON=199,MAX_LANGS=5;
const q={size:'launch',extras:{multi:false,blog:false,ana:false},langs:1,care:false,touched:false};
let qPrev={tier:null,keys:{}};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let qNote=null; // a function, so the note is re-worded when the language changes
const qmNote=fn=>{ qNote=fn||null; skEl('qmNote').textContent=qNote?qNote():''; };
const anyExtra=()=>q.extras.multi||q.extras.blog||q.extras.ana;
// Only a blog or SEO & analytics needs Business; extra languages are a paid add-on on Launch
const needsBusiness=()=>q.extras.blog||q.extras.ana;
const langAddon=()=>q.size==='launch'&&q.extras.multi?LANG_ADDON*q.langs:0;
function syncLangs(){
  const box=skEl('qmLangs');
  if(box) box.hidden=!(q.size==='launch'&&q.extras.multi);
  const sel=skEl('qmLangCount');
  if(sel) sel.value=String(q.langs);
}
// the audit is not a website package: it has its own name and checks, and the website features don't apply
const pkgLabel=tier=>tier==='audit'?QM[lang].audit.name:I18N[lang][PKG[tier].name].replace(/&amp;/g,'&');
function syncExtras(){
  const off=q.size==='audit';
  if(off) q.extras={multi:false,blog:false,ana:false};
  document.querySelectorAll('input[name=qmExtra]').forEach(c=>{c.disabled=off; if(off) c.checked=false;});
}
function saveQuote(){
  try{sessionStorage.setItem('wy-quote',JSON.stringify({size:q.size,extras:q.extras,langs:q.langs,care:q.care}));}catch(e){}
}
function restoreQuote(){
  try{
    const saved=JSON.parse(sessionStorage.getItem('wy-quote')||'null');
    if(!saved||!Object.hasOwn(PRICE,saved.size)) return false;
    q.size=saved.size;
    Object.keys(q.extras).forEach(k=>{q.extras[k]=saved.extras?.[k]===true;});
    q.care=saved.care===true;
    const n=Number(saved.langs); q.langs=Number.isInteger(n)&&n>=1&&n<=MAX_LANGS?n:1;
    if(q.size==='launch'&&needsBusiness()) q.size='business';
    if(q.size==='audit') q.extras={multi:false,blog:false,ana:false};
    document.querySelector('input[name=qmSize][value='+q.size+']').checked=true;
    document.querySelectorAll('input[name=qmExtra]').forEach(c=>{c.checked=q.extras[c.value];});
    document.querySelector('input[name=qmCare]').checked=q.care;
    syncExtras();
    return true;
  }catch(e){return false;}
}

function renderQuote(animate){
  saveQuote();
  const d=I18N[lang],m=QM[lang],name=skEl('qmName').value.trim();
  const tier=q.size,price=PRICE[tier],pkgName=pkgLabel(tier);
  document.querySelectorAll('[data-qm-price]').forEach(el=>{el.textContent=m.from+m.nfmt(PRICE[el.dataset.qmPrice]);});
  const isNew=k=>animate&&!qPrev.keys[k]?' new':'';
  const keys={};
  let lines='';
  ['multi','blog','ana'].forEach(k=>{
    if(!q.extras[k]) return;
    keys[k]=1;
    const addon=tier==='launch'&&k==='multi';
    const tag=addon?'<span class="tag">+'+m.nfmt(LANG_ADDON*q.langs)+'</span>':tier==='store'?'<span class="tag q">'+m.quoted+'</span>':'<span class="tag">'+m.incl+'</span>';
    lines+='<li class="ask'+isNew(k)+'"><span class="tick" aria-hidden="true"></span><span>'+m.x[k]+(addon?' ('+m.langs(q.langs)+')':'')+'</span>'+tag+'</li>';
  });
  if(tier==='audit') m.audit.f.forEach((text,i)=>{
    keys['a'+i]=1;
    lines+='<li class="inc'+isNew('a'+i)+'"><span class="plus" aria-hidden="true"></span><span>'+text+'</span></li>';
  });
  else PKG[tier].f.forEach(fk=>{
    const k=Object.keys(EXTRA_FEAT).find(x=>EXTRA_FEAT[x]===fk);
    if(k&&q.extras[k]) return; // already listed above as something they asked for
    keys[fk]=1;
    lines+='<li class="inc'+isNew(fk)+'"><span class="plus" aria-hidden="true"></span><span>'+d[fk]+'</span></li>';
  });
  const total=price+langAddon(),vat=Math.round(total*VAT);
  const care=q.care?'<div class="r-row r-care'+isNew('care')+'"><span>'+m.care+'</span><span class="dots"></span><span>'+m.nfmt(CARE)+m.mo+'</span></div>':'';
  if(q.care) keys.care=1;
  const stamp=animate&&qPrev.tier!==tier?' stamp':'';
  skEl('qmBody').innerHTML=
    '<div class="r-head"><span class="r-title">'+m.title+'</span>'+(name?'<span class="r-for">'+m.forWho+esc(name)+'</span>':'')+'</div>'+
    '<div class="r-row r-pkg"><span>'+esc(pkgName)+'</span><span class="dots"></span><span>'+m.from+m.nfmt(price)+'</span></div>'+
    '<ul class="r-lines">'+lines+'</ul>'+care+
    '<div class="r-total"><span>'+(tier==='audit'?m.audit.total:m.total)+'</span><mark class="'+stamp.trim()+'">'+m.from+m.nfmt(total)+'</mark></div>'+
    '<p class="r-vat">'+m.vat+m.nfmt(vat)+(tier==='store'&&anyExtra()?'<br>'+m.extraQ:'')+(tier==='audit'?'<br>'+m.audit.credit:'')+'</p>';
  skEl('qmNote').textContent=qNote?qNote():'';
  syncLangs();
  qPrev={tier:tier,keys:keys};
  skEl('qmLive').textContent=(qNote?qNote()+' ':'')+m.live(pkgName,m.from+m.nfmt(total)+(q.care?' + '+m.nfmt(CARE)+m.mo:''));
  const dockInfo=document.getElementById('dockInfo');
  if(dockInfo){
    const name=document.createElement('span'),price=document.createElement('b');
    name.textContent=pkgName; price.textContent=m.from+m.nfmt(total);
    dockInfo.replaceChildren(name,price);
  }
}

document.querySelectorAll('input[name=qmSize]').forEach(r=>r.addEventListener('change',function(){
  q.touched=true; q.size=this.value; qmNote();
  syncExtras();
  if(q.size==='launch'&&needsBusiness()){
    q.extras.blog=false; q.extras.ana=false;
    document.querySelectorAll('input[name=qmExtra]').forEach(c=>{if(c.value!=='multi') c.checked=false;});
    qmNote(()=>QM[lang].down);
  }
  renderQuote(true);
}));
document.querySelectorAll('input[name=qmExtra]').forEach(c=>c.addEventListener('change',function(){
  q.touched=true; q.extras[this.value]=this.checked; qmNote();
  if(this.checked&&q.size==='launch'&&this.value!=='multi'){
    q.size='business';
    document.querySelector('input[name=qmSize][value=business]').checked=true;
    const k=this.value; qmNote(()=>QM[lang].up(QM[lang].x[k]));
  }
  renderQuote(true);
}));
skEl('qmLangCount').addEventListener('change',function(){
  const n=Number(this.value); q.langs=n>=1&&n<=MAX_LANGS?n:1; q.touched=true; renderQuote(true);
});
document.querySelector('input[name=qmCare]').addEventListener('change',function(){ q.touched=true; q.care=this.checked; renderQuote(true); });

// What the visitor typed into the sketch on the home page (this tab only)
const TRADE={
  bakery:{en:'Bakery',fi:'Leipomo',sv:'Bageri'},trades:{en:'Trades & repairs',fi:'Remontit ja korjaukset',sv:'Renoveringar och reparationer'},
  coach:{en:'Coach & consultant',fi:'Valmennus ja konsultointi',sv:'Coach och konsult'},other:{en:'Other business',fi:'Muu yritystoiminta',sv:'Annan verksamhet'},
  burger:{en:'Burger joint',fi:'Burgeripaikka',sv:'Hamburgerställe'},cafe:{en:'Café',fi:'Kahvila',sv:'Kafé'},hair:{en:'Hair salon',fi:'Kampaamo',sv:'Frisersalong'},
  plumber:{en:'Plumber',fi:'Putkimies',sv:'Rörmokare'},shop:{en:'Small online shop',fi:'Pieni verkkokauppa',sv:'Liten webbutik'}
};
function stored(){
  try{
    const s=JSON.parse(sessionStorage.getItem('wy-sketch')||'{}');
    return s&&typeof s==='object'&&!Array.isArray(s)?s:{};
  }catch(e){return {};}
}

skEl('qmName').addEventListener('input',function(){
  try{ sessionStorage.setItem('wy-sketch',JSON.stringify(Object.assign(stored(),{name:this.value.trim()}))); }catch(e){}
  renderQuote(false);
});

// Plan cards open the builder with that package selected
document.querySelectorAll('[data-qm-size]').forEach(a=>a.addEventListener('click',function(){
  document.querySelector('input[name=qmSize][value='+this.dataset.qmSize+']').click();
}));

// The brief the contact form starts with, worded in the current language
function qmBrief(){
  const d=I18N[lang],m=QM[lang],name=skEl('qmName').value.trim();
  const type=stored().type,trade=Object.hasOwn(TRADE,type)?TRADE[type]:null,label=trade?trade[lang]:'';
  const pkg=pkgLabel(q.size);
  const extras=['multi','blog','ana'].filter(k=>q.extras[k]).map(k=>k==='multi'&&q.size==='launch'?m.x[k]+' ('+m.langs(q.langs)+', +'+m.nfmt(LANG_ADDON*q.langs)+')':m.x[k]);
  const price=m.from+m.nfmt(PRICE[q.size]);
  let who;
  if(lang==='fi') who=name?'Yritykseni on '+name+(label?' ('+label+')':'')+'. ':(label?'Toimin alalla: '+label+'. ':'');
  else if(lang==='sv') who=name?'Mitt företag heter '+name+(label?' ('+label+')':'')+'. ':(label?'Jag är verksam inom: '+label+'. ':'');
  else who=name?'My business is '+name+(label?' ('+label+')':'')+'. ':(label?'I work in: '+label+'. ':'');
  if(lang==='sv') return q.size==='audit'
    ? 'Hej! '+who+'Jag skulle vilja ha en granskning av min nuvarande webbplats ('+price+', exkl. moms)'+(q.care?' och är också intresserad av underhållspaketet':'')+'. Webbplatsens adress: '
    : 'Hej! '+who+'Jag har gjort en prisuppskattning: '+pkg+' ('+price+', exkl. moms)'+(extras.length?' med '+extras.join(', '):'')+(q.care?' samt underhållspaketet':'')+'. Hör av er!';
  if(q.size==='audit') return lang==='fi'
    ? 'Hei! '+who+'Haluaisin auditoinnin nykyiselle sivustolleni ('+price+', alv 0 %)'+(q.care?' ja kiinnostaisi myös ylläpitopaketti':'')+'. Sivuston osoite: '
    : 'Hi! '+who+'I\u2019d like an audit of my current site ('+price+', excl. VAT)'+(q.care?' and I\u2019m also interested in the care plan':'')+'. My site\u2019s address: ';
  return lang==='fi'
    ? 'Hei! '+who+'Kokosin hinta-arvion: '+pkg+' ('+price+', alv 0 %)'+(extras.length?', lisäksi '+extras.join(', '):'')+(q.care?' ja ylläpitopaketti':'')+'. Jutellaan!'
    : 'Hi! '+who+'I put together an estimate: '+pkg+' ('+price+', excl. VAT)'+(extras.length?' with '+extras.join(', '):'')+(q.care?' plus the care plan':'')+'. Let\u2019s talk!';
}

// Hand the whole thing to the contact form, so the first message is already a brief.
// Text the visitor has typed or edited is never overwritten; only an empty box or our own untouched brief is.
function qmHandoff(){
  const ta=skEl('msg');
  if(!ta) return;
  if(!ta.value||(ta.dataset.auto!==undefined&&ta.value===ta.dataset.auto)){
    const msg=qmBrief(); ta.value=msg; ta.dataset.auto=msg;
  }
  const audit=skEl('optAudit');
  if(q.size==='audit'&&audit) skEl('type').value=audit.value;
  else skEl('type').selectedIndex=q.size==='store'?2:0;
  ta.dispatchEvent(new Event('input',{bubbles:true}));
  skEl('type').dispatchEvent(new Event('change',{bubbles:true}));
  setTimeout(()=>skEl('name')?.focus({preventScroll:true}),450);
}
skEl('qmGo').addEventListener('click',qmHandoff);
const dockGo=document.getElementById('dockGo');
if(dockGo) dockGo.addEventListener('click',qmHandoff);

langHooks.push(function(l,first){
  if(first){
    const s=stored();
    skEl('qmName').value=s.name?String(s.name).slice(0,40):'';
    const restored=restoreQuote();
    if(!restored&&s.type==='shop'){
      q.size='store';
      document.querySelector('input[name=qmSize][value=store]').checked=true;
    }
  }else{
    // an untouched brief follows the language switch
    const ta=skEl('msg');
    if(ta.dataset.auto!==undefined&&ta.value===ta.dataset.auto){ const msg=qmBrief(); ta.value=msg; ta.dataset.auto=msg; }
  }
  renderQuote(false);
});
