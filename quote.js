const skEl=id=>document.getElementById(id);
// ---- Quote machine: real package prices only ----
Object.assign(I18N.fi,{
  qm_h2:"Rakenna tarjouksesi ja katso hinnan tulostuvan.",
  qm_p:"Valitse mitä tarvitset. Käytämme vain oikeita pakettihintojamme, joten näkemäsi on puhelun lähtökohta — ei piilokuluja.",
  qm_size:"Kuinka iso projektisi on?",
  qm_s1:"Yksi sivu",qm_s1d:"Yksi viimeistelty sivu, joka kertoo kaiken",
  qm_s2:"Jopa viisi sivua",qm_s2d:"Kokonainen yrityssivusto",
  qm_s3:"Verkkokauppa",qm_s3d:"Myy tuotteitasi ja vastaanota maksuja",
  qm_more:"Jotain extraa?",
  qm_x_bil:"Suomi + englanti",qm_x_blog:"Blogi tai uutiset",qm_x_ana:"SEO &amp; analytiikka",qm_x_care:"Ylläpitopaketti",
  qm_cta:"Lähetä tämä WebYellolle",
  qm_fine:"Ensin maksuton 30 minuutin puhelu, sitten kiinteä tarjous. Täältä ei lähde mitään."
});
I18N.en.qm_cta="Send this to WebYello";
Object.assign(I18N.fi,{qm_name:"Yrityksesi nimi (vapaaehtoinen)",qm_name_ph:"Aamun Leipomo"});
I18N.en.qm_name_ph="Sunrise Bakery";

const QM={
  en:{title:'Your quote',forWho:'for ',from:'from ',incl:'in the package',quoted:'quoted on the call',care:'Care plan',mo:'/month',total:'Total to start',vat:'excl. VAT · with 25.5% VAT ≈ ',extraQ:'Extras on top of the Store package are quoted on the call.',
      up:l=>l+' is part of the Business package, so we moved you up.',down:'One page can’t include those, so we unticked them.',
      live:(p,t)=>p+' package, '+t,x:{bil:'Finnish + English',blog:'Blog or news',ana:'SEO & analytics'},nfmt:n=>'€'+n.toLocaleString('en-US')},
  fi:{title:'Tarjouksesi',forWho:'yritykselle ',from:'alk. ',incl:'paketissa',quoted:'hinnoitellaan puhelussa',care:'Ylläpitopaketti',mo:'/kk',total:'Yhteensä alkuun',vat:'alv 0 % · alv 25,5 % mukana ≈ ',extraQ:'Verkkokauppapaketin päälle tulevat lisät hinnoitellaan puhelussa.',
      up:l=>l+' kuuluu Yrityssivut-pakettiin, joten siirsimme sinut sinne.',down:'Yhden sivun pakettiin ne eivät kuulu, joten poistimme valinnat.',
      live:(p,t)=>p+'-paketti, '+t,x:{bil:'Suomi + englanti',blog:'Blogi tai uutiset',ana:'SEO & analytiikka'},nfmt:n=>n.toLocaleString('fi-FI')+' €'}
};
const PRICE={launch:690,business:1390,store:2490};
const PKG={launch:{name:'p1_t',f:['p1_f1','p1_f2','p1_f3','p1_f4']},business:{name:'p2_t',f:['p2_f1','p2_f2','p2_f3','p2_f4']},store:{name:'p3_t',f:['p3_f1','p3_f2','p3_f3','p3_f4']}};
const EXTRA_FEAT={bil:'p2_f2',blog:'p2_f3',ana:'p2_f4'};
const CARE=59,VAT=1.255;
const q={size:'launch',extras:{bil:false,blog:false,ana:false},care:false,touched:false};
let qPrev={tier:null,keys:{}};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let qNote=null; // a function, so the note is re-worded when the language changes
const qmNote=fn=>{ qNote=fn||null; skEl('qmNote').textContent=qNote?qNote():''; };
const anyExtra=()=>q.extras.bil||q.extras.blog||q.extras.ana;

function renderQuote(animate){
  const d=I18N[lang],m=QM[lang],name=skEl('qmName').value.trim();
  const tier=q.size,price=PRICE[tier],pkgName=d[PKG[tier].name].replace(/&amp;/g,'&');
  document.querySelectorAll('[data-qm-price]').forEach(el=>{el.textContent=m.from+m.nfmt(PRICE[el.dataset.qmPrice]);});
  const isNew=k=>animate&&!qPrev.keys[k]?' new':'';
  const keys={};
  let lines='';
  ['bil','blog','ana'].forEach(k=>{
    if(!q.extras[k]) return;
    keys[k]=1;
    const tag=tier==='store'?'<span class="tag q">'+m.quoted+'</span>':'<span class="tag">'+m.incl+'</span>';
    lines+='<li class="ask'+isNew(k)+'"><span aria-hidden="true">✓</span><span>'+m.x[k]+'</span>'+tag+'</li>';
  });
  PKG[tier].f.forEach(fk=>{
    const k=Object.keys(EXTRA_FEAT).find(x=>EXTRA_FEAT[x]===fk);
    if(k&&q.extras[k]) return; // already listed above as something they asked for
    keys[fk]=1;
    lines+='<li class="inc'+isNew(fk)+'"><span aria-hidden="true">+</span><span>'+d[fk]+'</span></li>';
  });
  const total=price,vat=Math.round(total*VAT);
  const care=q.care?'<div class="r-row r-care'+isNew('care')+'"><span>'+m.care+'</span><span class="dots"></span><span>'+m.nfmt(CARE)+m.mo+'</span></div>':'';
  if(q.care) keys.care=1;
  const stamp=animate&&qPrev.tier!==tier?' stamp':'';
  skEl('qmBody').innerHTML=
    '<div class="r-head"><span class="r-title">'+m.title+'</span>'+(name?'<span class="r-for">'+m.forWho+esc(name)+'</span>':'')+'</div>'+
    '<div class="r-row r-pkg"><span>'+esc(pkgName)+'</span><span class="dots"></span><span>'+m.from+m.nfmt(price)+'</span></div>'+
    '<ul class="r-lines">'+lines+'</ul>'+care+
    '<div class="r-total"><span>'+m.total+'</span><mark class="'+stamp.trim()+'">'+m.from+m.nfmt(total)+'</mark></div>'+
    '<p class="r-vat">'+m.vat+m.nfmt(vat)+(tier==='store'&&anyExtra()?'<br>'+m.extraQ:'')+'</p>';
  skEl('qmNote').textContent=qNote?qNote():'';
  qPrev={tier:tier,keys:keys};
  skEl('qmLive').textContent=m.live(pkgName,m.from+m.nfmt(total)+(q.care?' + '+m.nfmt(CARE)+m.mo:''));
}

document.querySelectorAll('input[name=qmSize]').forEach(r=>r.addEventListener('change',function(){
  q.touched=true; q.size=this.value; qmNote();
  if(q.size==='launch'&&anyExtra()){
    q.extras={bil:false,blog:false,ana:false};
    document.querySelectorAll('input[name=qmExtra]').forEach(c=>{c.checked=false;});
    qmNote(()=>QM[lang].down);
  }
  renderQuote(true);
}));
document.querySelectorAll('input[name=qmExtra]').forEach(c=>c.addEventListener('change',function(){
  q.touched=true; q.extras[this.value]=this.checked; qmNote();
  if(this.checked&&q.size==='launch'){
    q.size='business';
    document.querySelector('input[name=qmSize][value=business]').checked=true;
    const k=this.value; qmNote(()=>QM[lang].up(QM[lang].x[k]));
  }
  renderQuote(true);
}));
document.querySelector('input[name=qmCare]').addEventListener('change',function(){ q.touched=true; q.care=this.checked; renderQuote(true); });

// What the visitor typed into the sketch on the home page (this tab only)
const TRADE={
  bakery:{en:'Bakery',fi:'Leipomo'},hair:{en:'Hair & barber',fi:'Kampaamo & parturi'},trades:{en:'Trades & repairs',fi:'Remontit & korjaukset'},
  coach:{en:'Coach & consultant',fi:'Valmentaja & konsultti'},cafe:{en:'Café & restaurant',fi:'Kahvila & ravintola'},shop:{en:'Small shop',fi:'Pieni verkkokauppa'},other:{en:'Something else',fi:'Jotain muuta'}
};
function stored(){ try{ return JSON.parse(sessionStorage.getItem('wy-sketch')||'{}')||{}; }catch(e){ return {}; } }

skEl('qmName').addEventListener('input',function(){
  try{ sessionStorage.setItem('wy-sketch',JSON.stringify(Object.assign(stored(),{name:this.value.trim()}))); }catch(e){}
  renderQuote(false);
});

// Plan cards open the builder with that package selected
document.querySelectorAll('[data-qm-size]').forEach(a=>a.addEventListener('click',function(){
  document.querySelector('input[name=qmSize][value='+this.dataset.qmSize+']').click();
}));

// Hand the whole thing to the contact form, so the first message is already a brief
skEl('qmGo').addEventListener('click',function(){
  const d=I18N[lang],m=QM[lang],name=skEl('qmName').value.trim();
  const trade=TRADE[stored().type],label=trade?trade[lang]:'';
  const pkg=d[PKG[q.size].name].replace(/&amp;/g,'&');
  const extras=['bil','blog','ana'].filter(k=>q.extras[k]).map(k=>m.x[k]);
  const price=m.from+m.nfmt(PRICE[q.size]);
  let who;
  if(lang==='fi') who=name?'Yritykseni on '+name+(label?' ('+label+')':'')+'. ':(label?'Toimin alalla: '+label+'. ':'');
  else who=name?'My business is '+name+(label?' ('+label+')':'')+'. ':(label?'I work in: '+label+'. ':'');
  const msg=lang==='fi'
    ? 'Hei! '+who+'Kokosin tarjouksen: '+pkg+' ('+price+', alv 0 %)'+(extras.length?', lisäksi '+extras.join(', '):'')+(q.care?' ja ylläpitopaketti':'')+'. Jutellaan!'
    : 'Hi! '+who+'I built a quote: '+pkg+' ('+price+', excl. VAT)'+(extras.length?' with '+extras.join(', '):'')+(q.care?' plus the care plan':'')+'. Let’s talk!';
  const ta=skEl('msg');
  if(!ta.value||ta.dataset.skFilled){ ta.value=msg; ta.dataset.skFilled='1'; }
  skEl('type').selectedIndex=q.size==='store'?2:0;
  setTimeout(()=>skEl('name').focus({preventScroll:true}),450);
});

langHooks.push(function(l,first){
  if(first){
    const s=stored();
    skEl('qmName').value=s.name?String(s.name).slice(0,40):'';
    if(s.type==='shop'){
      q.size='store';
      document.querySelector('input[name=qmSize][value=store]').checked=true;
    }
  }
  renderQuote(false);
});
