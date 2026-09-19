// ---- Sketch prototype: instant homepage sketch ----
Object.assign(I18N.fi,{
  sk_h2:"Näe verkkosivusi jo ennen ensimmäistä puhelua.",
  sk_p:"Kirjoita yrityksesi nimi, valitse alasi ja saat nopean luonnoksen etusivustasi. Se on tarkoituksella keskeneräinen — oikean suunnittelemme yhdessä kanssasi.",
  sk_name:"Yrityksesi nimi",sk_name_ph:"Aamun Leipomo",
  sk_type:"Mitä teet?",
  sk_t_bakery:"Leipomo",sk_t_hair:"Kampaamo &amp; parturi",sk_t_trades:"Remontit &amp; korjaukset",sk_t_coach:"Valmentaja &amp; konsultti",sk_t_cafe:"Kahvila &amp; ravintola",sk_t_shop:"Pieni verkkokauppa",sk_t_other:"Jotain muuta",
  sk_cta:"Paljonko se maksaisi?",
  sk_note:"Mitään ei lähetetä minnekään — tämä pysyy selaimessasi.",
  sk_stamp:"vain<br>luonnos"
});
I18N.en.sk_name_ph="Sunrise Bakery";

const SK={
  bakery:{ink:'yellow',layout:'split',thumb:'',form:0,
    en:{h:'Fresh from the oven, every morning.',sub:'Bread, buns and cakes baked by hand, right in your neighbourhood.',c:['Our breads','Order a cake','Opening hours'],cta:'Order for Saturday'},
    fi:{h:'Tuoretta suoraan uunista, joka aamu.',sub:'Käsintehtyä leipää, pullaa ja kakkuja aivan naapurustossasi.',c:['Leipomme','Tilaa kakku','Aukioloajat'],cta:'Tilaa lauantaiksi'}},
  hair:{ink:'blue',layout:'center',thumb:'',form:0,
    en:{h:'Look good. Feel even better.',sub:'Cuts, colour and a proper chat.',c:['Services & prices','Meet the team','Book a time'],cta:'Book a time'},
    fi:{h:'Näytä hyvältä. Voi vielä paremmin.',sub:'Leikkaukset, värit ja kunnon jutustelu.',c:['Palvelut ja hinnat','Tiimi','Varaa aika'],cta:'Varaa aika'}},
  trades:{ink:'blue',layout:'split',thumb:'',form:0,
    en:{h:'Fixed right, the first time.',sub:'Reliable local help with clear prices and no surprises.',c:['What we do','Get a quote','Areas we cover'],cta:'Ask for a quote'},
    fi:{h:'Kunnossa jo ensimmäisellä kerralla.',sub:'Luotettavaa apua läheltä, selkeillä hinnoilla ja ilman yllätyksiä.',c:['Mitä teemme','Pyydä tarjous','Toiminta-alue'],cta:'Pyydä tarjous'}},
  coach:{ink:'yellow',layout:'center',thumb:'',form:0,
    en:{h:'Find your next step.',sub:'One-to-one sessions that turn "maybe" into a plan.',c:['How I work','Who I help','Book a call'],cta:'Book a free intro'},
    fi:{h:'Löydä seuraava askeleesi.',sub:'Kahdenkeskisiä tapaamisia, jotka muuttavat ”ehkä” suunnitelmaksi.',c:['Näin työskentelen','Kenelle','Varaa puhelu'],cta:'Varaa tutustumiskeskustelu'}},
  cafe:{ink:'yellow',layout:'split',thumb:'',form:0,
    en:{h:'Come hungry. Leave happy.',sub:'Good food, a warm room and friendly faces.',c:['Menu','Find us','Book a table'],cta:'Book a table'},
    fi:{h:'Tule nälkäisenä. Lähde tyytyväisenä.',sub:'Hyvää ruokaa, lämmin tila ja ystävälliset kasvot.',c:['Ruokalista','Löydä meille','Varaa pöytä'],cta:'Varaa pöytä'}},
  shop:{ink:'blue',layout:'split',thumb:'tall',form:2,
    en:{h:'Made with care. Shipped with a smile.',sub:'Browse our favourites and have them delivered to your door.',c:['New in','Bestsellers','Delivery'],cta:'Shop now'},
    fi:{h:'Tehty huolella. Lähetetty hymyllä.',sub:'Selaa suosikkejamme ja tilaa ne ovellesi.',c:['Uutuudet','Suosikit','Toimitus'],cta:'Osta nyt'}},
  other:{ink:'yellow',layout:'center',thumb:'',form:0,
    en:{h:'Your business, in one clear sentence.',sub:'A short line about what you do and who it is for.',c:['What we do','About us','Get in touch'],cta:'Get in touch'},
    fi:{h:'Yrityksesi yhdessä selkeässä lauseessa.',sub:'Lyhyt rivi siitä, mitä teet ja kenelle.',c:['Mitä teemme','Meistä','Ota yhteyttä'],cta:'Ota yhteyttä'}}
};
const SK_FALLBACK={en:'Your business',fi:'Yrityksesi nimi'};
const skEl=id=>document.getElementById(id);

function skSlug(name){
  const full=name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  let s=full;
  if(s.length>24){
    s=s.slice(0,24);
    const cut=s.lastIndexOf('-');
    if(full[24]!=='-'&&cut>8) s=s.slice(0,cut); // don't leave half a word ("...-p.fi")
    s=s.replace(/-+$/,'');
  }
  return (s||(lang==='fi'?'yritys':'yourbusiness'))+'.fi';
}
function skType(){ return document.querySelector('input[name=skType]:checked').value; }

function renderSketch(animate){
  const t=SK[skType()],c=t[lang],name=skEl('skName').value.trim();
  const page=skEl('skPage');
  page.dataset.ink=t.ink; page.dataset.layout=t.layout; page.dataset.thumb=t.thumb;
  const brand=skEl('skBrand');
  brand.textContent=name||SK_FALLBACK[lang];
  brand.classList.toggle('empty',!name);
  skEl('skUrl').textContent=skSlug(name);
  skEl('skH').textContent=c.h; skEl('skSub').textContent=c.sub; skEl('skBtn').textContent=c.cta;
  ['skC1','skC2','skC3'].forEach((id,i)=>{skEl(id).textContent=c.c[i];});
  skEl('skMock').setAttribute('aria-label',(lang==='fi'?'Etusivuluonnos: ':'Homepage sketch: ')+(name||SK_FALLBACK[lang])+' — '+c.h);
  if(animate){ page.classList.remove('print'); void page.offsetWidth; page.classList.add('print'); }
}

// What the visitor typed follows them to the pricing page (this tab only), so the quote can say who it is for
function skSave(){
  try{ sessionStorage.setItem('wy-sketch',JSON.stringify({name:skEl('skName').value.trim(),type:skType()})); }catch(e){}
}
skEl('skName').addEventListener('input',()=>{ renderSketch(false); skSave(); });
document.querySelectorAll('input[name=skType]').forEach(r=>r.addEventListener('change',()=>{ renderSketch(true); skSave(); }));

langHooks.push(function(l,first){
  if(first){
    try{
      const s=JSON.parse(sessionStorage.getItem('wy-sketch')||'{}');
      if(s.name) skEl('skName').value=String(s.name).slice(0,40);
      if(SK[s.type]) document.querySelector('input[name=skType][value='+s.type+']').checked=true;
    }catch(e){}
  }
  renderSketch(!!first);
});
