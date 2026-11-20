// ---- Audit order page: pick an audit, fill in the brief, pay through Stripe Checkout ----
// Prices here are only for display. /api/checkout recalculates every price on the server.
(function(){
const form=document.getElementById('orderForm');
if(!form) return;
const el=id=>document.getElementById(id);
const SITE={small:390,large:590,store:890},AI=249,VAT=0.255;
const M={
  en:{title:'Your order',site:'Website audit',ai:'AI visibility audit',types:{small:'small site',large:'larger or WordPress site',store:'online store'},
      net:'Total excl. VAT',vat:'VAT 25.5%',gross:'Total incl. VAT',
      notes:['Report by email within 3 business days','Optional 20-minute walkthrough included','Half of the fee is credited against fixes or a new site ordered within 30 days'],
      req:'Complete this field.',url:'Enter your website address, such as www.example.fi.',terms:'Accept the order terms to continue.',
      going:'Opening the payment page…',fail:'We couldn’t open the payment page. Your details are still here. Try again or email <a href="mailto:info@netyello.com">info@netyello.com</a>.',
      cancelled:'Payment was cancelled, so nothing was charged. Your details are still here.',
      fmt:n=>'€'+n.toLocaleString('en-US',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})},
  sv:{title:'Din beställning',site:'Webbplatsgranskning',ai:'AI-synlighetsgranskning',types:{small:'liten webbplats',large:'större webbplats eller WordPress',store:'webbutik'},
      net:'Totalt exkl. moms',vat:'Moms 25,5 %',gross:'Totalt inkl. moms',
      notes:['Rapporten per e-post inom 3 arbetsdagar','En valfri genomgång på 20 minuter ingår','Hälften av avgiften krediteras mot åtgärder eller en ny webbplats som beställs inom 30 dagar'],
      req:'Fyll i det här fältet.',url:'Ange webbplatsens adress, till exempel www.exempel.fi.',terms:'Godkänn beställningsvillkoren för att fortsätta.',
      going:'Betalningssidan öppnas…',fail:'Vi kunde inte öppna betalningssidan. Dina uppgifter finns kvar. Försök igen eller mejla <a href="mailto:info@netyello.com">info@netyello.com</a>.',
      cancelled:'Betalningen avbröts och ingenting debiterades. Dina uppgifter finns kvar.',
      fmt:n=>n.toLocaleString('fi-FI',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})+' €'},
  fi:{title:'Tilauksesi',site:'Sivustoauditointi',ai:'AI-näkyvyysauditointi',types:{small:'pieni sivusto',large:'laajempi tai WordPress-sivusto',store:'verkkokauppa'},
      net:'Yhteensä alv 0 %',vat:'Alv 25,5 %',gross:'Yhteensä sis. alv',
      notes:['Raportti sähköpostiisi 3 arkipäivän kuluessa','Halutessasi 20 minuutin läpikäynti sisältyy hintaan','Puolet hinnasta hyvitetään 30 päivän kuluessa tilatuista korjauksista tai uudesta sivustosta'],
      req:'Täytä tämä kenttä.',url:'Anna sivuston osoite muodossa www.esimerkki.fi.',terms:'Hyväksy tilausehdot jatkaaksesi.',
      going:'Avataan maksusivua…',fail:'Maksusivun avaaminen epäonnistui. Tietosi ovat tallella. Yritä uudelleen tai lähetä sähköpostia osoitteeseen <a href="mailto:info@netyello.com">info@netyello.com</a>.',
      cancelled:'Maksu peruttiin, eikä mitään veloitettu. Tietosi ovat tallella.',
      fmt:n=>n.toLocaleString('fi-FI',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})+' €'}
};
const m=M[lang]||M.fi;
const FIELDS=['orUrl','orBiz','orInd','orArea','orQ1','orQ2','orQ3','orQ4','orQ5','orComp','orName','orEmail','orPhone'];
const val=n=>(form.querySelector('input[name='+n+']:checked')||{}).value;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const round=n=>Math.round(n*100)/100;
// accepts "example.fi", "www.example.fi" or a full https:// address
function normUrl(v){
  v=v.trim(); if(!v) return '';
  if(!/^https?:\/\//i.test(v)) v='https://'+v;
  try{ const u=new URL(v); return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname)?u.href:''; }catch(e){ return ''; }
}

function items(){
  const a=val('audit'),t=val('siteType'),out=[];
  if(a==='site'||a==='both') out.push({name:m.site+' ('+m.types[t]+')',price:SITE[t]});
  if(a==='ai'||a==='both') out.push({name:m.ai,price:AI});
  return out;
}
function render(){
  const a=val('audit');
  el('orSiteType').hidden=a==='ai';
  el('orAi').hidden=a==='site';
  el('orArea').required=a!=='site';
  const list=items(),net=list.reduce((s,i)=>s+i.price,0),vat=round(net*VAT);
  el('orBody').innerHTML=
    '<div class="r-head"><span class="r-title">'+m.title+'</span></div>'+
    list.map(i=>'<div class="r-row r-pkg"><span>'+esc(i.name)+'</span><span class="dots"></span><span>'+m.fmt(i.price)+'</span></div>').join('')+
    '<ul class="r-lines">'+m.notes.map(n=>'<li class="inc"><span class="plus" aria-hidden="true"></span><span>'+n+'</span></li>').join('')+'</ul>'+
    '<div class="r-total"><span>'+m.net+'</span><mark>'+m.fmt(net)+'</mark></div>'+
    '<p class="r-vat">'+m.vat+' '+m.fmt(vat)+' · '+m.gross+' '+m.fmt(round(net+vat))+'</p>';
}

function check(f){
  f.setCustomValidity('');
  const v=f.value.trim();
  if(f.id==='orTerms'){ if(!f.checked) f.setCustomValidity(m.terms); return; }
  if(f.required&&!v){ f.setCustomValidity(f.id==='orEmail'?I18N[lang].f_err_email:f.id==='orName'?I18N[lang].f_err_name:m.req); return; }
  if(f.id==='orUrl'&&v&&!normUrl(v)) f.setCustomValidity(m.url);
  if(f.id==='orEmail'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) f.setCustomValidity(I18N[lang].f_err_email);
}
form.querySelectorAll('input:not([type=radio])').forEach(f=>{
  f.addEventListener('input',()=>check(f));
  f.addEventListener('change',()=>check(f));
});
form.querySelectorAll('input[type=radio]').forEach(r=>r.addEventListener('change',()=>{ render(); }));

// details survive a cancelled payment (this tab only); cleared once paid
function save(){
  try{
    const d={audit:val('audit'),siteType:val('siteType')};
    FIELDS.forEach(id=>d[id]=el(id).value);
    sessionStorage.setItem('wy-order',JSON.stringify(d));
  }catch(e){}
}
function restore(){
  try{
    const d=JSON.parse(sessionStorage.getItem('wy-order')||'null');
    if(!d||typeof d!=='object') return;
    ['audit','siteType'].forEach(n=>{ const r=form.querySelector('input[name='+n+'][value="'+String(d[n]).replace(/[^a-z]/g,'')+'"]'); if(r) r.checked=true; });
    FIELDS.forEach(id=>{ if(typeof d[id]==='string') el(id).value=d[id].slice(0,300); });
  }catch(e){}
}

const params=new URLSearchParams(location.search);
const status=el('orStatus');
if(params.get('status')==='paid'){
  try{ sessionStorage.removeItem('wy-order'); }catch(e){}
  el('orderGrid').hidden=true; el('terms').hidden=true;
  const dock=el('dock'); if(dock) dock.remove();
  const done=el('orderDone'); done.hidden=false; done.focus();
}else{
  restore();
  const pick=params.get('audit');
  if(['site','ai','both'].includes(pick)) form.querySelector('input[name=audit][value='+pick+']').checked=true;
  if(params.get('status')==='cancelled') status.textContent=m.cancelled;
}
render();

form.addEventListener('submit',async function(e){
  e.preventDefault();
  if(form.dataset.sending) return;
  form.querySelectorAll('input:not([type=radio])').forEach(check);
  if(!form.reportValidity()) return;
  const btn=el('orPay'),label=btn.textContent;
  form.dataset.sending='1'; btn.disabled=true; btn.textContent=m.going;
  status.classList.remove('err'); status.textContent='';
  save();
  const a=val('audit');
  const body={
    audit:a,siteType:a==='ai'?'':val('siteType'),url:normUrl(el('orUrl').value),business:el('orBiz').value,industry:el('orInd').value,
    area:a==='site'?'':el('orArea').value,
    questions:a==='site'?[]:['orQ1','orQ2','orQ3','orQ4','orQ5'].map(id=>el(id).value).filter(v=>v.trim()),
    competitors:a==='site'?'':el('orComp').value,
    name:el('orName').value,email:el('orEmail').value,phone:el('orPhone').value,
    terms:el('orTerms').checked,website:form.querySelector('[name=website]').value,lang:lang
  };
  try{
    const res=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const out=await res.json().catch(()=>({}));
    if(!res.ok||typeof out.url!=='string'||!/^https:\/\/checkout\.stripe\.com\//.test(out.url)) throw new Error('checkout '+res.status);
    location.href=out.url;
  }catch(err){
    status.classList.add('err'); status.innerHTML=m.fail;
    btn.disabled=false; btn.textContent=label; delete form.dataset.sending;
  }
});
})();
