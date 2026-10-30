
const btn=document.getElementById('menuBtn'),links=document.getElementById('navLinks');
btn.addEventListener('click',()=>{
  const open=links.classList.toggle('open');
  btn.setAttribute('aria-expanded',open);
});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  links.classList.remove('open');
  btn.setAttribute('aria-expanded','false');
}));


// Each page is generated in its own language (Finnish at /, English at /en/), so nothing is translated here.
// I18N holds only the messages the scripts write themselves; everything else is read from the page.
const lang=document.documentElement.lang==='en'?'en':'fi';
const I18N={
  en:{
    f_success_h:"Thanks — that's in.",
    f_success_p:"We'll read it over and get back to you within one business day with ideas, honest advice, and a fixed quote. Keep an eye on your inbox.",
    f_err_required:"This field is required.",
    f_err_email:"Please enter a valid email address.",
    f_sending:"Sending…",
    f_err_send:'Sorry, that didn’t go through. Please try again, or email <a href="mailto:info@netyello.com">info@netyello.com</a>.'
  },
  fi:{
    f_success_h:"Kiitos — viesti meni perille.",
    f_success_p:"Käymme sen läpi ja palaamme asiaan yhden arkipäivän kuluessa ideoiden, rehellisten neuvojen ja kiinteän tarjouksen kera. Pidä silmällä sähköpostiasi.",
    f_err_required:"Tämä kenttä on pakollinen.",
    f_err_email:"Anna kelvollinen sähköpostiosoite.",
    f_sending:"Lähetetään…",
    f_err_send:'Valitettavasti lähetys ei onnistunut. Yritä uudelleen tai kirjoita osoitteeseen <a href="mailto:info@netyello.com">info@netyello.com</a>.'
  }
};

// Scripts that build text (the quote, the sketch, the speed readout) register here and run once on load
const langHooks=[];
document.addEventListener('DOMContentLoaded',function(){
  // the page's own strings (plan names and features, button labels) become available to the scripts
  const d=I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(el=>{d[el.dataset.i18n]??=el.innerHTML});
  langHooks.forEach(h=>h(lang,true));
});


document.querySelectorAll('#contactForm [required]').forEach(function(field){
  field.addEventListener('invalid',function(){
    const d=I18N[lang];
    if(field.validity.typeMismatch) field.setCustomValidity(d.f_err_email);
    else if(field.validity.valueMissing) field.setCustomValidity(d.f_err_required);
    else field.setCustomValidity('');
  });
  field.addEventListener('input',function(){ field.setCustomValidity(''); });
});

// Send the enquiry to /api/contact; only show the thank-you once the server has accepted it
const contactForm=document.getElementById('contactForm');
contactForm.addEventListener('submit',async function(e){
  e.preventDefault();
  if(contactForm.dataset.sending) return;
  const d=I18N[lang],btn=contactForm.querySelector('button[type=submit]'),status=document.getElementById('formStatus');
  contactForm.dataset.sending='1';
  btn.disabled=true; btn.textContent=d.f_sending;
  status.textContent=''; status.classList.remove('err');
  try{
    const res=await fetch('/api/contact',{
      method:'POST',
      signal:window.AbortSignal&&AbortSignal.timeout?AbortSignal.timeout(15000):undefined,
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
    contactForm.innerHTML='<div class="success" role="status" tabindex="-1"><div class="success-badge" aria-hidden="true"><span class="tick"></span></div><h3>'+d.f_success_h+'</h3><p>'+d.f_success_p+'</p></div>';
    contactForm.querySelector('.success').focus();
  }catch(err){
    // keep everything they typed so they can simply try again
    const now=I18N[lang];
    status.classList.add('err'); status.innerHTML=now.f_err_send;
    btn.disabled=false; btn.textContent=now.f_send;
    delete contactForm.dataset.sending;
  }
});

// Fade sections in as they scroll into view
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const revealEls = document.querySelectorAll('.sec-head, .ticket, .card, .plan, #contactForm, .contact-inner > div');
  revealEls.forEach(function(el){
    const siblingIndex = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.transitionDelay = (siblingIndex%3)*70 + 'ms';
    el.classList.add('pre-reveal');
  });
  const io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        const el = entry.target;
        el.classList.remove('pre-reveal');
        io.unobserve(el);
        setTimeout(function(){ el.style.transitionDelay=''; },700);
      }
    });
  },{threshold:.15, rootMargin:'0px 0px -8% 0px'});
  revealEls.forEach(function(el){ io.observe(el); });
}

// The phone dock steps aside while the contact form is on screen, and on the home page while the
// hero copy is on screen, so it never covers the hero's own buttons or the speed readout
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
})();

// The site proves its own speed: measure this very page in the visitor's browser (home page only)
(function(){
  const out={load:document.getElementById('perfLoad'),fcp:document.getElementById('perfFcp'),bytes:document.getElementById('perfBytes')};
  if(!out.load||!window.performance||!performance.getEntriesByType) return;
  const v={load:null,fcp:null,bytes:null};
  const num=(n,d)=>{ const s=n.toFixed(d); return lang==='fi'?s.replace('.',','):s; };
  const sec=ms=>ms==null?'—':num(ms/1000,2)+' s';
  const kb=b=>b==null?'—':(b<1024*1024?num(b/1024,0)+(lang==='fi'?' kt':' KB'):num(b/1048576,2)+(lang==='fi'?' Mt':' MB'));
  function render(){ out.load.textContent=sec(v.load); out.fcp.textContent=sec(v.fcp); out.bytes.textContent=kb(v.bytes); }
  // compressed size of everything the page fetched (cross-origin files that hide their size count as 0)
  function weight(){
    let total=0;
    const nav=performance.getEntriesByType('navigation')[0];
    if(nav) total+=nav.encodedBodySize||0;
    performance.getEntriesByType('resource').forEach(r=>{ total+=r.encodedBodySize||0; });
    return total||null;
  }
  try{
    new PerformanceObserver(function(list){
      list.getEntries().forEach(e=>{ if(e.name==='first-contentful-paint'){ v.fcp=e.startTime; render(); } });
    }).observe({type:'paint',buffered:true});
  }catch(e){}
  function onLoad(){
    setTimeout(function(){
      const nav=performance.getEntriesByType('navigation')[0];
      v.load=nav&&nav.loadEventStart?nav.loadEventStart:null;
      v.bytes=weight();
      if(v.fcp==null){ const p=performance.getEntriesByName('first-contentful-paint')[0]; if(p) v.fcp=p.startTime; }
      render();
    },0);
  }
  if(document.readyState==='complete') onLoad(); else window.addEventListener('load',onLoad);
  langHooks.push(render);
})();
