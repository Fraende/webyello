/* Vääntö Garage – interaktiiviset osat. Ei kolmansia osapuolia, ei evästeitä. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var store = {
    get: function () { try { return JSON.parse(sessionStorage.getItem("vg_services") || "[]"); } catch (e) { return []; } },
    set: function (a) { try { sessionStorage.setItem("vg_services", JSON.stringify(a)); } catch (e) {} }
  };

  /* ---------- header, nav ---------- */
  var hdr = $("#hdr"), burger = $("#burger"), nav = $("#nav");
  function onScroll() { hdr.classList.toggle("solid", scrollY > 30); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", function () {
    var o = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", o);
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }); });

  /* ---------- reveal ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .15 });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else { $$(".rv").forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- sivun oma suorituskyky ---------- */
  function perf() {
    var n = performance.getEntriesByType("navigation")[0];
    var f = performance.getEntriesByName("first-contentful-paint")[0];
    var bytes = 0;
    if (n) bytes += n.transferSize || n.encodedBodySize || 0;
    performance.getEntriesByType("resource").forEach(function (r) { bytes += r.transferSize || r.encodedBodySize || 0; });
    var ok = function (v) { return v && isFinite(v) && v > 0; };
    var set = function (id, v, u) { $(id).innerHTML = (ok(v) ? v : "–") + "<i>" + u + "</i>"; };
    set("#pLoad", n && Math.round(n.loadEventEnd), "ms");
    set("#pFcp", f && Math.round(f.startTime), "ms");
    set("#pBytes", bytes && Math.round(bytes / 1024), "kt");
  }
  addEventListener("load", function () {
    setTimeout(function () { perf(); heroVideo(); }, 300);
  });

  /* ---------- hero-video ladataan mittauksen jälkeen ---------- */
  function heroVideo() {
    var v = $("#heroVid");
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || save || innerWidth < 700) return;
    v.src = "assets/hero.mp4";
    v.addEventListener("playing", function () { v.style.opacity = 1; }, { once: true });
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  }

  /* ---------- palvelut ---------- */
  var IC = {
    huolto: '<path d="M14 6a4 4 0 0 0 5 5l-9 9a2.5 2.5 0 0 1-4-4l9-9"/><path d="M14 6l3-3 4 4-3 3"/>',
    diag: '<path d="M2 12h5l3-7 4 14 3-7h5"/>',
    viritys: '<rect x="6" y="6" width="12" height="12"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><rect x="10" y="10" width="4" height="4"/>',
    dyno: '<circle cx="12" cy="13" r="9"/><path d="M12 13l5-6M5 13h2M17 13h2M12 6v2"/>',
    jarrut: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="5.5" r=".8"/><circle cx="12" cy="18.5" r=".8"/><circle cx="5.5" cy="12" r=".8"/><circle cx="18.5" cy="12" r=".8"/>',
    kalvo: '<path d="M4 20l8-8"/><path d="M12 12l4-9 5 5-9 4z"/><path d="M4 20c0-2 1-3 3-3"/>'
  };
  var SVC = [
    { id: "huolto", t: "Huolto ja korjaus", img: "garage", ic: "huolto", d: "Määräaikaishuollot, jakopää, renkaat ja korjaukset. Tehdään oikein ja kirjataan ylös.", l: ["Öljyt, suodattimet ja nesteet", "Jakohihna tai -ketju", "Renkaanvaihto ja tasapainotus", "Katsastusta edeltävä tarkastus"] },
    { id: "diagnostiikka", t: "Diagnostiikka", img: "engine", ic: "diag", d: "Luemme viat ja seuraamme live-dataa, jotta vika löytyy arvailun sijaan.", l: ["Vikakoodien luku ja nollaus", "Live-data ja lokit ajon aikana", "Painetestit ja vuotohaut", "Selkeä raportti löydöksistä"] },
    { id: "viritys", t: "ECU-viritys ja osat", img: "ecu", ic: "viritys", d: "Räätälöity ohjelmisto ja tarvittaessa imu-, pako- ja jäähdytysosat.", l: ["Ohjelmisto autokohtaisesti", "Imu, pakoputkisto, intercooler", "Lämmönhallinta ja luotettavuus", "Mittaus ennen ja jälkeen"] },
    { id: "dyno", t: "Dyno-mittaus", img: "dyno", ic: "dyno", d: "Rullatesti kertoo todellisen tehon ja väännön käyrinä, ei pelkkinä lukuina.", l: ["Teho- ja vääntökäyrä", "Polttoaineseos ja ahtopaine", "Vertailu ennen ja jälkeen", "Tulosteet talteen"] },
    { id: "jarrut", t: "Jarrut ja alusta", img: "brakes", ic: "jarrut", d: "Jos tehoa tulee lisää, pitää myös pysähtyä. Jarrut, jousitus ja geometria kuntoon.", l: ["Levyt, palat ja nesteet", "Jousitus ja iskunvaimentimet", "Pyöränsuuntaus", "Rata-asetukset erikseen"] },
    { id: "kalvotus", t: "Kalvotus ja maalaus", img: "orange", ic: "kalvo", d: "Uusi väri, mattapinta tai suojakalvo. Suunnitellaan sopimaan autosi linjoihin.", l: ["Värikalvotus", "Suojakalvo kivenlentoa vastaan", "Yksittäisten osien maalaus", "Värimallit paikan päällä"] }
  ];
  var grid = $("#svcGrid");
  var sel = store.get();
  function svcHTML(s, i) {
    return '<article class="svc has-img rv d' + (i % 3) + '" id="svc-' + s.id + '">' +
      '<div class="bg"><img src="assets/' + s.img + '-800.webp" alt="" loading="lazy" width="800" height="450"></div>' +
      '<span class="no">0' + (i + 1) + '</span>' +
      '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + IC[s.ic] + '</svg>' +
      '<h3>' + s.t + '</h3><p>' + s.d + '</p>' +
      '<div class="more" id="m-' + s.id + '"><ul>' + s.l.map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul></div>' +
      '<div class="row"><button class="toggle" type="button" aria-expanded="false" aria-controls="m-' + s.id + '">Lisää tietoa</button>' +
      '<button class="chip pickbtn" type="button" data-id="' + s.id + '" aria-pressed="false">+ Lisää varaukseen</button></div></article>';
  }
  grid.innerHTML = SVC.map(svcHTML).join("");
  $$(".svc", grid).forEach(function (c) {
    var t = $(".toggle", c);
    t.addEventListener("click", function () {
      var o = c.classList.toggle("open"); t.setAttribute("aria-expanded", o); t.textContent = o ? "Sulje" : "Lisää tietoa";
    });
  });
  function syncPicks() {
    $$(".pickbtn").forEach(function (b) {
      var on = sel.indexOf(b.dataset.id) > -1;
      b.setAttribute("aria-pressed", on); b.textContent = on ? "✓ Varauksessa" : "+ Lisää varaukseen";
    });
    var cta = $(".nav .btn"); cta.textContent = sel.length ? "Varaa aika (" + sel.length + ")" : "Varaa aika";
    store.set(sel);
  }
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".pickbtn"); if (!b) return;
    var i = sel.indexOf(b.dataset.id);
    if (i > -1) sel.splice(i, 1); else sel.push(b.dataset.id);
    syncPicks();
  });
  syncPicks();
  $$(".svc", grid).forEach(function (c) { if (window.IntersectionObserver) io.observe(c); else c.classList.add("in"); });

  /* ---------- dyno ---------- */
  var STAGES = [
    { n: "Stage 1", s: "Ohjelmisto", amp: .14, c: 3800, w: 1700, base: .03, info: "Ohjausyksikön ohjelmisto sovitetaan alkuperäisille osille. Pienin muutos, selkein hyöty arjessa." },
    { n: "Stage 2", s: "Ohjelmisto ja osat", amp: .22, c: 4300, w: 2000, base: .06, info: "Imu-, pako- ja jäähdytysosat uusitaan ja ohjelmisto räätälöidään niille." },
    { n: "Stage 3", s: "Laaja projekti", amp: .30, c: 4800, w: 2400, base: .09, info: "Isommat muutokset. Edellyttää jarrujen ja alustan kuntoon laittoa, suunnitellaan aina tapauskohtaisesti." }
  ];
  var cv = $("#dynoCv"), ctx = cv.getContext("2d"), cur = 0, prog = 1, W = 0, H = 0, rpmEl = $("#rpm");
  var tabs = $("#stageTabs");
  tabs.innerHTML = STAGES.map(function (s, i) {
    return '<button role="tab" type="button" id="tab' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '"><b>' + s.n + '</b><span>' + s.s + '</span></button>';
  }).join("") + '<p class="stage-info" id="stageInfo">' + STAGES[0].info + '</p>';
  var tabEls = $$('[role=tab]', tabs);
  function selectStage(i) {
    cur = i;
    tabEls.forEach(function (t, k) { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; });
    $("#stageInfo").textContent = STAGES[i].info; play();
  }
  tabEls.forEach(function (t, i) {
    t.addEventListener("click", function () { selectStage(i); });
    t.addEventListener("keydown", function (e) {
      var k = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (k) { e.preventDefault(); var n = (i + k + 3) % 3; tabEls[n].focus(); selectStage(n); }
    });
  });
  function g(x) { return Math.exp(-x * x); }
  function stockT(r) { var t = .6 + .4 * g((r - 4300) / 2200); var f = Math.max(0, Math.min(1, (r - 5500) / 1500)); return t * (1 - .38 * f * f * (3 - 2 * f)); }
  var tMax = 0, pMax = 0, r0;
  for (r0 = 2000; r0 <= 7000; r0 += 50) { tMax = Math.max(tMax, stockT(r0)); pMax = Math.max(pMax, stockT(r0) * r0); }
  function T0(r) { return 100 * stockT(r) / tMax; }
  function P0(r) { return 100 * stockT(r) * r / pMax; }
  function gain(r, s) { return 1 + s.base + s.amp * g((r - s.c) / s.w); }
  function T1(r) { return T0(r) * gain(r, STAGES[cur]); }
  function P1(r) { return P0(r) * gain(r, STAGES[cur]); }
  function size() {
    var d = Math.min(devicePixelRatio || 1, 2), b = cv.getBoundingClientRect();
    W = b.width; H = b.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  var PAD = { l: 46, r: 14, t: 14, b: 32 }, YMAX = 180, YMIN = 20;
  function X(r) { return PAD.l + (r - 2000) / 5000 * (W - PAD.l - PAD.r); }
  function Y(v) { return PAD.t + (1 - (v - YMIN) / (YMAX - YMIN)) * (H - PAD.t - PAD.b); }
  function curve(fn, col, wd, dash, p) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, X(2000 + 5000 * p), H); ctx.clip();
    ctx.beginPath(); for (var r = 2000; r <= 7000; r += 25) { var x = X(r), y = Y(fn(r)); r === 2000 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash || []); ctx.lineJoin = "round"; ctx.stroke(); ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.font = "600 10px ui-monospace,Menlo,monospace"; ctx.fillStyle = "#97A3AB"; ctx.strokeStyle = "#252E35"; ctx.lineWidth = 1; ctx.setLineDash([]);
    for (var v = 20; v <= 180; v += 40) { ctx.beginPath(); ctx.moveTo(PAD.l, Y(v)); ctx.lineTo(W - PAD.r, Y(v)); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(v, PAD.l - 8, Y(v) + 3); }
    for (var r = 2000; r <= 7000; r += 1000) { ctx.beginPath(); ctx.moveTo(X(r), PAD.t); ctx.lineTo(X(r), H - PAD.b); ctx.stroke(); ctx.textAlign = "center"; ctx.fillText(r / 1000 + "k", X(r), H - 12); }
    ctx.textAlign = "right"; ctx.fillText("r/min", W - PAD.r, H - 12);
    curve(T0, "rgba(151,163,171,.55)", 1.5, [4, 4], prog);
    curve(P0, "#97A3AB", 2.2, null, prog);
    curve(T1, "#22E3CB", 2, [6, 4], prog);
    var grad = ctx.createLinearGradient(0, PAD.t, 0, H); grad.addColorStop(0, "rgba(255,90,31,.22)"); grad.addColorStop(1, "rgba(255,90,31,0)");
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, X(2000 + 5000 * prog), H); ctx.clip(); ctx.beginPath();
    for (var q = 2000; q <= 7000; q += 25) { q === 2000 ? ctx.moveTo(X(q), Y(P1(q))) : ctx.lineTo(X(q), Y(P1(q))); }
    ctx.lineTo(X(7000), H - PAD.b); ctx.lineTo(X(2000), H - PAD.b); ctx.closePath(); ctx.fillStyle = grad; ctx.fill(); ctx.restore();
    curve(P1, "#FF5A1F", 3, null, prog);
    var rp = +rpmEl.value, x = X(rp);
    ctx.strokeStyle = "#EEF2F4"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x, PAD.t); ctx.lineTo(x, H - PAD.b); ctx.stroke(); ctx.setLineDash([]);
    [[P0, "#97A3AB"], [P1, "#FF5A1F"], [T1, "#22E3CB"]].forEach(function (a) { ctx.beginPath(); ctx.arc(x, Y(a[0](rp)), 4.5, 0, 6.283); ctx.fillStyle = a[1]; ctx.fill(); ctx.strokeStyle = "#090B0D"; ctx.stroke(); });
    var p1 = P1(rp), p0 = P0(rp);
    $("#rRpm").textContent = rp; $("#rPow").textContent = p1.toFixed(0); $("#rTq").textContent = T1(rp).toFixed(0);
    var dl = (p1 / p0 - 1) * 100; $("#rDelta").textContent = "+" + dl.toFixed(0) + " %";
  }
  var raf;
  function play() {
    cancelAnimationFrame(raf);
    if (reduce) { prog = 1; draw(); return; }
    var t0 = performance.now(); prog = 0;
    (function step(t) { prog = Math.min(1, (t - t0) / 900); prog = 1 - Math.pow(1 - prog, 3); draw(); if (prog < 1) raf = requestAnimationFrame(step); })(t0);
  }
  function setRpmFromX(cx) { var b = cv.getBoundingClientRect(), r = 2000 + (cx - b.left - PAD.l) / (b.width - PAD.l - PAD.r) * 5000; rpmEl.value = Math.max(2000, Math.min(7000, Math.round(r / 50) * 50)); draw(); }
  cv.addEventListener("pointermove", function (e) { setRpmFromX(e.clientX); });
  cv.addEventListener("pointerdown", function (e) { setRpmFromX(e.clientX); });
  rpmEl.addEventListener("input", draw);
  $("#replay").addEventListener("click", play);
  addEventListener("resize", function () { size(); draw(); });
  size(); draw();
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { size(); play(); o.disconnect(); } }, { threshold: .3 }).observe(cv);

  /* ---------- moottoritila ---------- */
  var HOT = [
    { x: 29, y: 46, t: "Turbo", d: "Puristaa ilmaa moottoriin. Viritettäessä tärkeintä on oikea ahtopaine ja lämmönhallinta, ei pelkkä suurin luku." },
    { x: 21, y: 37, t: "Pakosarjan lämpösuoja", d: "Pitää lämmön putkistossa ja ympäröivät osat viileinä. Vaikuttaa myös turbon vasteeseen." },
    { x: 58, y: 59, t: "Ahtoilmaputkisto", d: "Kuljettaa paineistetun ilman intercoolerille. Sileämpi putkisto vähentää virtausvastusta, vuodot haetaan painetestillä." },
    { x: 81, y: 63, t: "Ilmansuodatin", d: "Avoin suodatin parantaa virtausta ja ääntä. Lämpö ja vesi pitää silti huomioida sijoituksessa." },
    { x: 79, y: 31, t: "Ohjausyksikkö (ECU)", d: "Auton aivot: ruiskutus, sytytys ja ahtopaine. Ohjelmisto räätälöidään ja testataan mittauksessa." },
    { x: 22, y: 90, t: "Intercooler", d: "Jäähdyttää ahtoilmaa. Viileämpi ilma tarkoittaa tasaisempaa tehoa ja pienempää koputusriskiä." },
    { x: 43, y: 26, t: "Sytytyspuolat", d: "Sytytyksen kunto ratkaisee kestääkö moottori kuorman. Tarkistetaan aina ennen mittausta." }
  ];
  var eng = $("#engine"), stage = $("#engineStage");
  HOT.forEach(function (h, i) {
    var b = document.createElement("button"); b.className = "hot"; b.type = "button";
    b.style.left = h.x + "%"; b.style.top = h.y + "%"; b.textContent = i + 1;
    b.setAttribute("aria-label", (i + 1) + ". " + h.t); b.setAttribute("aria-expanded", "false");
    b.addEventListener("click", function () {
      $$(".hot", eng).forEach(function (x) { x.setAttribute("aria-expanded", "false"); }); b.setAttribute("aria-expanded", "true");
      $("#hotNo").textContent = "Kohde " + (i + 1) + " / " + HOT.length; $("#hotTitle").textContent = h.t; $("#hotText").textContent = h.d;
    });
    stage.appendChild(b);
  });

  /* ---------- värit ---------- */
  $$(".sw").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".sw").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      $$("#stageImg img").forEach(function (im) { im.classList.toggle("on", im.dataset.c === b.dataset.c); });
    });
  });

  /* ---------- työlista ---------- */
  var ans = { fuel: null, use: null, goal: [] };
  var NAMES = {}; SVC.forEach(function (s) { NAMES[s.id] = s.t; });
  $$(".chips").forEach(function (box) {
    var q = box.dataset.q, multi = box.dataset.multi;
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return; var v = b.dataset.v;
      if (multi) { var i = ans[q].indexOf(v); i > -1 ? ans[q].splice(i, 1) : ans[q].push(v); b.setAttribute("aria-pressed", i === -1); }
      else { var on = ans[q] === v; ans[q] = on ? null : v; $$(".chip", box).forEach(function (x) { x.setAttribute("aria-pressed", !on && x === b); }); }
      plan();
    });
  });
  function plan() {
    var out = [], seen = {};
    function add(id, why) { if (!seen[id]) { seen[id] = out.length; out.push({ id: id, why: why }); } }
    ans.goal.forEach(function (g) {
      if (g === "vika") add("diagnostiikka", "Vika löytyy lukemalla viat ja seuraamalla live-dataa.");
      if (g === "teho") {
        add("dyno", "Lähtömittaus kertoo missä mennään ennen muutoksia.");
        add("viritys", ans.fuel === "diesel" ? "Dieselissä ohjelmisto tuo yleensä näkyvimmän lisän vääntöön." : ans.fuel === "hybridi" ? "Hybridien viritys on rajatumpaa. Selvitämme ensin mikä on mahdollista." : "Ohjelmisto ja tarvittaessa imu- ja pako-osat.");
        add("jarrut", "Lisääntyvä teho vaatii jarrujen ja alustan tarkistuksen.");
      }
      if (g === "jarrut") add("jarrut", "Levyt, palat ja jarrunesteet sekä jäähdytys kuntoon.");
      if (g === "hallinta") add("jarrut", "Jousitus, geometria ja renkaat ratkaisevat tuntuman.");
      if (g === "luotettava") { add("huolto", "Huollot ja kuluvat osat ajan tasalle."); add("diagnostiikka", "Tarkistetaan piilevät viat ennen kuin ne pysäyttävät auton."); }
      if (g === "ulkonako") add("kalvotus", "Väri, suojakalvo tai yksittäisten osien maalaus.");
    });
    if (ans.use === "talvi") add("huolto", "Talviin valmistautuminen: renkaat, akku ja jäähdytysneste.");
    if (ans.use === "rata") { add("jarrut", "Ratakäyttö kuormittaa jarruja ja jousitusta eniten."); add("huolto", "Öljyt, jäähdytys ja renkaat radan kuormaan sopiviksi."); }
    if (ans.use === "show") add("kalvotus", "Näyttelyautossa pinnan viimeistely ratkaisee.");
    var box = $("#planOut");
    if (!ans.goal.length && !ans.use) { box.innerHTML = '<p class="empty">Valitse vähintään yksi tavoite, niin työlista ilmestyy tähän.</p>'; return; }
    box.innerHTML = out.map(function (o, i) {
      return '<div class="rec" style="animation-delay:' + i * 70 + 'ms"><span class="n">0' + (i + 1) + '</span><b>' + NAMES[o.id] + '</b><p>' + o.why + '</p></div>';
    }).join("") + '<div><button class="btn" id="toBook" type="button">Vie varaukseen →</button></div>';
    $("#toBook").addEventListener("click", function () { store.set(out.map(function (o) { return o.id; })); location.href = "varaus.html"; });
  }

  /* ---------- kierroslukumittari ja moottoriääni ---------- */
  var ticks = $("#ticks"), NS = "http://www.w3.org/2000/svg";
  function ang(r) { return -120 + r / 8000 * 240; }
  function pt(a, rad) { var t = (a - 90) * Math.PI / 180; return [70 + Math.cos(t) * rad, 70 + Math.sin(t) * rad]; }
  for (var k = 0; k <= 16; k++) {
    var r = k * 500, major = k % 2 === 0, a = ang(r), p1 = pt(a, 62), p2 = pt(a, major ? 53 : 57);
    var ln = document.createElementNS(NS, "line"); ln.setAttribute("x1", p1[0]); ln.setAttribute("y1", p1[1]); ln.setAttribute("x2", p2[0]); ln.setAttribute("y2", p2[1]);
    ln.setAttribute("stroke", r >= 6500 ? "#FF5A1F" : "#97A3AB"); ln.setAttribute("stroke-width", major ? 2 : 1); ticks.appendChild(ln);
    if (major) { var tp = pt(a, 43), tx = document.createElementNS(NS, "text"); tx.setAttribute("x", tp[0]); tx.setAttribute("y", tp[1] + 3); tx.setAttribute("text-anchor", "middle"); tx.setAttribute("font-size", "9"); tx.setAttribute("font-family", "ui-monospace,monospace"); tx.setAttribute("fill", r >= 6500 ? "#FF5A1F" : "#EEF2F4"); tx.textContent = r / 1000; ticks.appendChild(tx); }
  }
  var needle = $("#needle"), gearTxt = $("#gearTxt"), revving = false, shown = 800;
  function setNeedle(r) { needle.style.transform = "rotate(" + ang(r) + "deg)"; }
  function scrollRpm() { var h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? scrollY / h : 0; return { r: 800 + Math.pow(p, .85) * 5600, p: p }; }
  function onScrollGauge() {
    if (revving) return; var s = scrollRpm(); setNeedle(s.r);
    gearTxt.textContent = s.p < .02 ? "N" : Math.min(6, Math.ceil(s.p * 6));
  }
  addEventListener("scroll", onScrollGauge, { passive: true }); onScrollGauge();

  var ac = null, o1, o2, gn, lp;
  function sound(on) {
    try {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        o1 = ac.createOscillator(); o2 = ac.createOscillator(); gn = ac.createGain(); lp = ac.createLowpass ? ac.createLowpass() : ac.createBiquadFilter();
        lp.type = "lowpass"; lp.Q.value = 6; o1.type = "sawtooth"; o2.type = "square";
        var ws = ac.createWaveShaper(), c = new Float32Array(256); for (var i = 0; i < 256; i++) { var x = i / 128 - 1; c[i] = Math.tanh(x * 3); } ws.curve = c;
        o1.connect(ws); o2.connect(ws); ws.connect(lp); lp.connect(gn); gn.connect(ac.destination); gn.gain.value = 0; o1.start(); o2.start();
      }
      if (ac.state === "suspended") ac.resume();
      gn.gain.setTargetAtTime(on ? .16 : 0, ac.currentTime, .08);
    } catch (e) {}
  }
  function setPitch(r) {
    if (!ac) return; var f = r / 60 * 2, t = ac.currentTime;
    o1.frequency.setTargetAtTime(f, t, .03); o2.frequency.setTargetAtTime(f * .5 + 1.2, t, .03);
    lp.frequency.setTargetAtTime(250 + r * .55, t, .05);
  }
  function rev() {
    if (revving) return; revving = true; gearTxt.textContent = "1";
    var btn = $("#startEngine"); btn.setAttribute("aria-pressed", "true"); sound(true);
    var t0 = performance.now(), L = [[0, 0], [350, 1100], [800, 900], [1300, 900], [2900, 6900], [3300, 6400], [3500, 6900], [5200, 1000], [6000, 900]];
    (function loop(t) {
      var e = t - t0, i = 1; while (i < L.length - 1 && e > L[i][0]) i++;
      var a = L[i - 1], b = L[i], u = Math.max(0, Math.min(1, (e - a[0]) / (b[0] - a[0]))); u = u * u * (3 - 2 * u);
      var r = a[1] + (b[1] - a[1]) * u; setNeedle(r); setPitch(r);
      if (e < L[L.length - 1][0]) requestAnimationFrame(loop);
      else { sound(false); revving = false; btn.setAttribute("aria-pressed", "false"); onScrollGauge(); }
    })(t0);
  }
  $("#startEngine").addEventListener("click", rev);
  $("#gauge").addEventListener("click", rev);
})();
