
const btn=document.getElementById('menuBtn'),links=document.getElementById('navLinks');
btn.addEventListener('click',()=>{
  const open=links.classList.toggle('open');
  btn.setAttribute('aria-expanded',open);
});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  links.classList.remove('open');
  btn.setAttribute('aria-expanded','false');
}));


const I18N={en:{},fi:{
  nav_services:"Palvelut",nav_process:"Prosessi",nav_pricing:"Hinnat",nav_cta:"Aloita projekti",
  hero_badge:"uusi studio<br>per. 2026",
  hero_h1:'Verkkosivut, jotka saavat ihmiset <mark>hymyilemään</mark> — ja klikkaamaan.',
  hero_lead:"WebYello suunnittelee ja rakentaa kauniita, intuitiivisia verkkosivuja, jotka muuttavat uteliaat kävijät tyytyväisiksi asiakkaiksi. Ison toimiston laatu, pienen studion sydän.",
  hero_cta1:"Luonnostele sivustosi",hero_cta2:"Katso hinnat",
  hero_note:"Maksuton 30 minuutin kartoituspuhelu · Ei ammattislangia, koskaan",
  sv_h2:"Kaikki mitä verkkosivusi tarvitsee, saman aurinkoisen katon alla.",
  sv_p:"Ensimmäisestä luonnoksesta julkaisupäivään (ja pitkälle sen jälkeen) hoidamme koko matkan, jotta sinä voit keskittyä liiketoimintaasi.",
  sv1_t:"Verkkosivujen suunnittelu",sv1_p:"Räätälöidyt ulkoasut, jotka vangitsevat persoonallisuutesi ja ohjaavat kävijät juuri sinne, minne haluat — ei valmispohjia.",
  sv2_t:"Web-kehitys",sv2_p:"Nopeat, turvalliset ja standardien mukaiset toteutukset, jotka toimivat moitteettomasti kaikilla laitteilla — laskeutumissivuista laajoihin alustoihin.",
  sv3_t:"Verkkokauppa",sv3_p:"Verkkokaupat, joissa ostaminen on helppoa — sujuva kassa, fiksut tuotesivut ja integraatiot työkaluihin, joita jo käytät.",
  sv4_t:"SEO &amp; suorituskyky",sv4_p:"Salamannopeat latausajat ja hakukoneystävällinen rakenne, jotta oikeat ihmiset löytävät sinut — ja jäävät.",
  sv5_t:"Brändäys &amp; ilme",sv5_p:"Logot, värit ja äänensävy, jotka tuntuvat erehtymättömästi sinulta — yhtenäinen ilme verkkosivuilla ja niiden ulkopuolella.",
  sv6_t:"Ylläpito &amp; tuki",sv6_p:"Päivitykset, varmuuskopiot, tietoturva ja pikkufiksaukset hoidettuna joka kuukausi — sivustosi pysyy tuoreena ja sinä nukut yösi rauhassa.",
  pr_h2:"Mutkaton prosessi ilman yllätyksiä.",
  pr_p:"Neljä selkeää vaihetta \"hauska tavata\" -hetkestä \"olemme livenä!\" -hetkeen — tiedät aina, missä projektisi on menossa.",
  st1_t:"Kartoitus",st1_p:"Juttelemme tavoitteistasi, yleisöstäsi ja tyylistäsi maksuttomalla kartoituspuhelulla. Sinä puhut, me kuuntelemme (ja teemme paljon muistiinpanoja).",
  st2_t:"Suunnittelu",st2_p:"Saat klikkailtavat mallit kommentoitavaksi — hiomme yhdessä, kunnes ulkoasu tuntuu juuri oikealta.",
  st3_t:"Toteutus",st3_p:"Muutamme suunnitelman nopeaksi, responsiiviseksi ja pikseleitä myöten viimeistellyksi sivustoksi — näet edistymisen matkan varrella.",
  st4_t:"Julkaisu &amp; kasvu",st4_p:"Julkaisemme, poksautamme konfetit ja jäämme rinnallesi ylläpidon, analytiikan ja jatkokehityksen kanssa.",
  pc_h2:"Selkeät paketit, rehelliset hinnat.",
  pc_p:"Olemme upouusi studio, ja sanomme sen suoraan: ei keksittyä portfoliota eikä tekaistuja arvosteluja. Sen sijaan saat perustajan täyden huomion jokaiseen projektiin — ja hinnat sen mukaan.",
  p1_t:"Startti",p1_for:"Kun haluat nopeasti verkkoon",p1_price:"alk. 690 €",
  p1_f1:"Viimeistelty yhden sivun sivusto",p1_f2:"Mobiiliystävällinen ja salamannopea",p1_f3:"Yhteydenottolomake ja kartta",p1_f4:"SEO-perusasetukset",
  p2_pop:"Suosituin",p2_t:"Yrityssivut",p2_for:"Kokonainen yrityssivusto",p2_price:"alk. 1 390 €",
  p2_f1:"Jopa 5 räätälöityä sivua",p2_f2:"Monikielinen sivustorakenne",p2_f3:"Blogi- tai uutisosio",p2_f4:"SEO- ja analytiikka-asetukset",
  p3_t:"Verkkokauppa",p3_for:"Kun haluat myydä verkossa",p3_price:"alk. 2 490 €",
  p3_f1:"Täysi verkkokauppa",p3_f2:"Maksut ja toimitukset valmiiksi",p3_f3:"Tuotesivupohjat",p3_f4:"Koulutus, jotta pyörität kauppaa itse",
  p_cta1:"Rakenna tarjous",p_cta2:"Rakenna tarjous",p_cta3:"Rakenna tarjous",
  pcare:"<b>Ylläpitopaketti — 59 €/kk:</b> päivitykset, varmuuskopiot, tietoturva ja pienet muutokset hoidettuna puolestasi — sivustosi pysyy tuoreena.",
  pc_vat:"Hintoihin lisätään alv (25,5 %). Jokainen projekti alkaa maksuttomalla kartoituspuhelulla ja kiinteällä tarjouksella — ei yllätyksiä.",
  ct_h2:"Valmis antamaan yrityksellesi verkkosivut, jotka se ansaitsee?",
  ct_lead:"Kerro hieman projektistasi, niin palaamme asiaan yhden arkipäivän kuluessa — ideoiden, rehellisten neuvojen ja selkeän tarjouksen kera.",
  ct_l2:"Maksuton 30 minuutin kartoituspuhelu",ct_l3:"Selkeät kiinteähintaiset tarjoukset",
  f_name:"Nimesi",f_name_ph:"Maija Meikäläinen",
  f_email:"Sähköposti",f_email_ph:"maija@esimerkki.fi",
  f_type:"Mitä tarvitset?",
  f_o1:"Kokonaan uudet verkkosivut",f_o2:"Nykyisen sivuston uudistuksen",f_o3:"Verkkokaupan",f_o4:"Jatkuvaa ylläpitoa &amp; tukea",f_o5:"Jotain muuta",
  f_msg:"Kerro projektistasi",
  f_msg_ph:"Pyöritämme pientä leipomoa ja tarvitsemme sivut, jotka tuoksuvat yhtä hyvältä kuin leipämme…",
  f_send:"Lähetä matkaan →",
  ft_contact:"Yhteystiedot",ft_copy:"© 2026 WebYello. Tehty suurella määrällä keltaista.",
  f_success_h:"Kiitos — viesti meni perille.",
  f_success_p:"Käymme sen läpi ja palaamme asiaan yhden arkipäivän kuluessa ideoiden, rehellisten neuvojen ja kiinteän tarjouksen kera. Pidä silmällä sähköpostiasi.",
  f_err_required:"Tämä kenttä on pakollinen.",
  f_err_email:"Anna kelvollinen sähköpostiosoite."
}};
I18N.en.f_success_h="Thanks — that's in.";
I18N.en.f_success_p="We'll read it over and get back to you within one business day with ideas, honest advice, and a fixed quote. Keep an eye on your inbox.";
I18N.en.f_err_required="This field is required.";
I18N.en.f_err_email="Please enter a valid email address.";
I18N.en.f_sending="Sending…";
I18N.en.f_err_send='Sorry, that didn\u2019t go through. Please try again, or email <a href="mailto:hello@webyello.com">hello@webyello.com</a>.';
Object.assign(I18N.fi,{
  f_sending:"Lähetetään…",
  f_err_send:'Valitettavasti lähetys ei onnistunut. Yritä uudelleen tai kirjoita osoitteeseen <a href="mailto:hello@webyello.com">hello@webyello.com</a>.',
  f_privacy:"Käytämme tietojasi vain vastataksemme sinulle."
});

// Strings for the multi-page structure
Object.assign(I18N.fi,{
  hm_h2:"Tutustu rauhassa.",
  hm_sv_t:"Kaikki saman katon alla",hm_pr_t:"Neljä askelta, ei yllätyksiä",hm_pc_t:"Kiinteät, rehelliset hinnat",
  hm_sv_p:"Suunnittelu, kehitys, verkkokaupat, SEO, brändäys ja ylläpito.",
  hm_pr_p:"Kartoitus, suunnittelu, toteutus, julkaisu. Tiedät aina, missä projektisi on.",
  hm_pc_p:"Startti alk. 690 €, Yrityssivut alk. 1 390 €, Verkkokauppa alk. 2 490 €. Aina kiinteä tarjous.",
  hm_sv_more:"Katso palvelut →",hm_pr_more:"Katso prosessi →",hm_pc_more:"Katso hinnat →",
  nx_process:"Katso miten se toimii →",nx_pricing:"Katso mitä se maksaa →",
  skip:"Siirry sisältöön",aria_nav:"Päävalikko",aria_lang:"Kieli",aria_menu:"Avaa valikko",
  sr_services:"Palvelumme",sr_steps:"Neljä vaihetta",sr_packages:"Paketit",
  ph_quote:"Rakenna oma tarjous ↓",dock_quote:"Lähetä tarjous"
});

// Every page registers hooks here; they run after each language change (first=true on page load)
const langHooks=[];
let lang='fi';
function setLang(l,first){
  lang=l;
  const d=I18N[l];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const v=d[el.dataset.i18n]; if(v!=null) el.innerHTML=v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const v=d[el.dataset.i18nPh]; if(v!=null) el.placeholder=v;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{
    const v=d[el.dataset.i18nAria]; if(v!=null) el.setAttribute('aria-label',v);
  });
  document.documentElement.lang=l;
  const ds=document.documentElement.dataset;
  document.title=(l==='fi'?ds.titleFi:ds.titleEn)||document.title;
  document.getElementById('btnEn').classList.toggle('active',l==='en');
  document.getElementById('btnFi').classList.toggle('active',l==='fi');
  document.getElementById('btnEn').setAttribute('aria-pressed',l==='en');
  document.getElementById('btnFi').setAttribute('aria-pressed',l==='fi');
  if(!first){ try{ localStorage.setItem('wy-lang',l); }catch(e){} }
  langHooks.forEach(h=>h(l,first));
}

// Capture English defaults from this page's markup, then start in the visitor's saved language (Finnish if none)
document.addEventListener('DOMContentLoaded',function(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{I18N.en[el.dataset.i18n]??=el.innerHTML});
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{I18N.en[el.dataset.i18nPh]??=el.placeholder});
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{I18N.en[el.dataset.i18nAria]??=el.getAttribute('aria-label')});
  let saved=null;
  try{ saved=localStorage.getItem('wy-lang'); }catch(e){}
  // ?lang=en / ?lang=fi makes a language linkable (e.g. from an English email signature) and is remembered
  const asked=new URLSearchParams(location.search).get('lang');
  if(asked==='en'||asked==='fi'){ saved=asked; try{ localStorage.setItem('wy-lang',asked); }catch(e){} }
  setLang(saved==='en'?'en':'fi',true);
  document.documentElement.classList.remove('i18n-pending');
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

// The phone dock steps aside while the contact form is on screen
(function(){
  const dock=document.getElementById('dock'),contact=document.getElementById('contact');
  if(!dock||!contact||!('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(es){ dock.classList.toggle('hide',es[0].isIntersecting); }).observe(contact);
})();

// The hero spheres drift forever; stop them while they are scrolled out of view
(function(){
  const art=document.querySelector('.hero-art');
  if(!art||!('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(es){ art.classList.toggle('paused',!es[0].isIntersecting); }).observe(art);
})();
