
const btn=document.getElementById('menuBtn'),links=document.getElementById('navLinks');
btn.addEventListener('click',()=>{
  const open=links.classList.toggle('open');
  btn.setAttribute('aria-expanded',open);
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&links.classList.contains('open')){
    links.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.focus();
  }
});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  links.classList.remove('open');
  btn.setAttribute('aria-expanded','false');
}));


// Each page is generated in its own language (Finnish at /, Swedish at /sv/, English at /en/), so nothing is translated here.
// I18N holds only the messages the scripts write themselves; everything else is read from the page.
const lang=['en','sv'].includes(document.documentElement.lang)?document.documentElement.lang:'fi';
const I18N={
  en:{
    f_success_h:"Thanks — that's in.",
    f_success_p:"We'll read it over and get back to you within one business day with ideas, honest advice, and a fixed quote. Keep an eye on your inbox.",
    f_err_required:"Complete this field.",
    f_err_name:"Enter your name.",
    f_err_msg:"Tell us briefly what you need.",
    f_err_email:"Enter an email address such as name@example.com.",
    f_sending:"Sending enquiry…",
    f_err_send:'We couldn’t confirm delivery. Your message is still here. Try again or email <a href="mailto:info@netyello.com">info@netyello.com</a>.'
  },
  sv:{
    f_success_h:"Tack — meddelandet har kommit fram.",
    f_success_p:"Vi läser igenom det och återkommer inom en arbetsdag med idéer, ärliga råd och en fast offert. Håll ett öga på din inkorg.",
    f_err_required:"Fyll i det här fältet.",
    f_err_name:"Skriv ditt namn.",
    f_err_msg:"Berätta kort vad du behöver.",
    f_err_email:"Ange en e-postadress, till exempel namn@exempel.fi.",
    f_sending:"Skickar förfrågan…",
    f_err_send:'Vi kunde inte bekräfta att meddelandet skickades. Ditt meddelande finns kvar. Försök igen eller mejla <a href="mailto:info@netyello.com">info@netyello.com</a>.'
  },
  fi:{
    f_success_h:"Kiitos — viesti meni perille.",
    f_success_p:"Käymme sen läpi ja palaamme asiaan yhden arkipäivän kuluessa ideoiden, rehellisten neuvojen ja kiinteän tarjouksen kera. Pidä silmällä sähköpostiasi.",
    f_err_required:"Täytä tämä kenttä.",
    f_err_name:"Kirjoita nimesi.",
    f_err_msg:"Kerro lyhyesti, mitä tarvitset.",
    f_err_email:"Anna sähköpostiosoite muodossa nimi@esimerkki.fi.",
    f_sending:"Lähetetään viestiä…",
    f_err_send:'Emme voineet vahvistaa lähetystä. Viestisi on tallella. Yritä uudelleen tai lähetä sähköpostia osoitteeseen <a href="mailto:info@netyello.com">info@netyello.com</a>.'
  }
};

// Scripts that build text (the quote, the sketch) register here and run once on load
const langHooks=[];
document.addEventListener('DOMContentLoaded',function(){
  // the page's own strings (plan names and features, button labels) become available to the scripts
  const d=I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(el=>{d[el.dataset.i18n]??=el.innerHTML});
  langHooks.forEach(h=>h(lang,true));
});


// Keep browser validation and the server's trimmed-input rules aligned.
function validateContactField(field){
  const d=I18N[lang];
  field.setCustomValidity('');
  if(!field.value.trim()) field.setCustomValidity(field.id==='email'?d.f_err_email:d['f_err_'+field.id]||d.f_err_required);
  else if(field.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) field.setCustomValidity(d.f_err_email);
}
document.querySelectorAll('#contactForm [required]').forEach(field=>{
  field.addEventListener('invalid',()=>validateContactField(field));
  field.addEventListener('input',()=>validateContactField(field));
});

// Send the enquiry to /api/contact; only show the thank-you once the server has accepted it
const contactForm=document.getElementById('contactForm');
contactForm.addEventListener('submit',async function(e){
  e.preventDefault();
  if(contactForm.dataset.sending) return;
  contactForm.querySelectorAll('[required]').forEach(validateContactField);
  if(!contactForm.reportValidity()) return;
  const d=I18N[lang],btn=contactForm.querySelector('button[type=submit]'),status=document.getElementById('formStatus');
  contactForm.dataset.sending='1';
  btn.disabled=true; btn.textContent=d.f_sending;
  contactForm.setAttribute('aria-busy','true');
  const controller=typeof AbortController==='function'?new AbortController():null;
  const timeout=controller?setTimeout(()=>controller.abort(),15000):null;
  status.textContent=''; status.classList.remove('err');
  try{
    const res=await fetch('/api/contact',{
      method:'POST',
      signal:controller?controller.signal:undefined,
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        name:document.getElementById('name').value,
        email:document.getElementById('email').value,
        type:document.getElementById('type').value,
        msg:document.getElementById('msg').value,
        website:contactForm.querySelector('[name=website]').value,
        lang:lang,
        page:location.pathname
      })
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const result=await res.json();
    if(result.ok!==true) throw new Error('No send confirmation');
    contactForm.removeAttribute('aria-busy');
    contactForm.innerHTML='<div class="success" role="status" tabindex="-1"><div class="success-badge" aria-hidden="true"><span class="tick"></span></div><h3>'+d.f_success_h+'</h3><p>'+d.f_success_p+'</p></div>';
    contactForm.querySelector('.success').focus();
  }catch(err){
    // keep everything they typed so they can simply try again
    const now=I18N[lang];
    status.classList.add('err'); status.innerHTML=now.f_err_send;
    btn.disabled=false; btn.textContent=now.f_send;
    delete contactForm.dataset.sending;
    contactForm.removeAttribute('aria-busy');
  }finally{
    if(timeout!==null) clearTimeout(timeout);
  }
});

// Home demo strip: fetch the thumbnails only as the strip nears the viewport, so they stay off the
// initial page load. Without IntersectionObserver they load straight away.
(function(){
  const strip=document.querySelector('.home-demos');
  if(!strip) return;
  if(!('IntersectionObserver' in window)){ strip.classList.add('seen'); return; }
  const o=new IntersectionObserver(entries=>{
    if(entries.some(e=>e.isIntersecting)){ strip.classList.add('seen'); o.disconnect(); }
  },{rootMargin:'400px 0px'});
  o.observe(strip);
})();

// Enhance only after the observer exists: unavailable APIs must never hide content.
if('IntersectionObserver' in window&&window.matchMedia&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const revealEls=document.querySelectorAll('.sec-head, .ticket, .card, .plan, .demo, #contactForm, .contact-inner > div');
  const reveal=(el,instant=false)=>{
    if(instant){el.style.transitionDelay='0s';el.style.transitionDuration='0s';}
    el.classList.remove('pre-reveal');io.unobserve(el);
    setTimeout(()=>{el.style.transitionDelay='';el.style.transitionDuration='';},700);
  };
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting) reveal(entry.target);});
  },{threshold:.15,rootMargin:'0px 0px -8% 0px'});
  revealEls.forEach(el=>{
    el.style.transitionDelay=(Array.prototype.indexOf.call(el.parentElement.children,el)%3)*70+'ms';
    el.classList.add('pre-reveal');
    el.addEventListener('focusin',()=>reveal(el,true),{once:true});
    io.observe(el);
  });
}

// The phone dock steps aside while the contact form is on screen, and on the home page while the
// hero copy or the demo builder's example is on screen, so it never covers their own buttons
(function(){
  const dock=document.getElementById('dock'),contact=document.getElementById('contact');
  if(!dock||!contact||!('IntersectionObserver' in window)) return;
  const heroCopy=document.querySelector('.hero-scene .hero-copy'),seen=new Set();
  function watch(el,margin){
    new IntersectionObserver(function(es){
      es.forEach(function(e){ e.isIntersecting?seen.add(e.target):seen.delete(e.target); });
      dock.classList.toggle('hide',seen.size>0);
    },{rootMargin:margin}).observe(el);
  }
  watch(contact,'0px');
  // the top margin skips the strip under the sticky nav
  if(heroCopy) watch(heroCopy,'-80px 0px 0px 0px');
  // and while the demo builder's example site is on screen, so it never covers the example's own order and call bars
  const mock=document.getElementById('skMock');
  if(mock) watch(mock,'-80px 0px -20% 0px');
})();

// "Ask for an audit" style links pre-select the matching option in the enquiry form
document.querySelectorAll('[data-pick-type]').forEach(function(a){
  a.addEventListener('click',function(){
    const sel=document.getElementById('type'),opt=document.getElementById(a.dataset.pickType);
    if(!sel||!opt) return;
    sel.value=opt.value;
    sel.dispatchEvent(new Event('change',{bubbles:true}));
  });
});


// ---- Motion moments (all skipped under reduced motion) ----
const wyMotion=!!(window.matchMedia&&!matchMedia('(prefers-reduced-motion: reduce)').matches);

// Hero headline: on the first visit in this tab the words are set one by one
(function(){
  const h=document.querySelector('.hero-scene h1');
  if(!h||!wyMotion) return;
  try{ if(sessionStorage.getItem('wy-hero')) return; sessionStorage.setItem('wy-hero','1'); }catch(e){ return; }
  let k=0;
  (function split(node){
    Array.from(node.childNodes).forEach(function(n){
      if(n.nodeType===1){ split(n); return; }
      if(n.nodeType!==3) return;
      const frag=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(function(part){
        if(!part) return;
        if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
        const s=document.createElement('span'); s.className='w'; s.style.setProperty('--k',k++); s.textContent=part; frag.appendChild(s);
      });
      n.replaceWith(frag);
    });
  })(h);
  h.parentElement.style.setProperty('--n',k);
  h.classList.add('set');
})();

// Numbers count up to their value. The text keeps its own format ("alk. 1 390 €", "from €1,390"): only the digits run.
function wyCount(el,from){
  const full=el.textContent,m=full.match(/\d[\d\s.,  ]*\d|\d/);
  if(!m||!wyMotion) return;
  const raw=m[0],to=parseInt(raw.replace(/\D/g,''),10),sep=(raw.match(/\D/)||[''])[0];
  from=from||0; if(!(to>0)||to===from) return;
  const fmt=n=>sep?String(n).replace(/\B(?=(\d{3})+(?!\d))/g,sep):String(n);
  const t0=performance.now(),dur=600;
  cancelAnimationFrame(el._wyRaf);
  (function tick(t){
    const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=p<1?full.replace(raw,fmt(Math.round(from+(to-from)*e))):full;
    if(p<1) el._wyRaf=requestAnimationFrame(tick);
  })(t0);
}
if(wyMotion&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); wyCount(e.target); } });
  },{threshold:.6});
  document.querySelectorAll('.plan .price').forEach(function(el){ io.observe(el); });

  // Process: the gold line draws across the steps when they come into view
  const strip=document.querySelector('.strip');
  if(strip){
    strip.classList.add('pre-draw');
    const so=new IntersectionObserver(function(es){
      if(es.some(function(e){return e.isIntersecting;})){ so.disconnect(); strip.classList.remove('pre-draw'); }
    },{threshold:.3});
    so.observe(strip);
  }
}
