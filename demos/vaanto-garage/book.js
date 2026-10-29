/* Vääntö Garage – ajanvarauksen vaiheet. Demo: tietoja ei lähetetä eikä tallenneta. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVC = [
    ["huolto", "Huolto ja korjaus", "Huollot, jakopää, renkaat"],
    ["diagnostiikka", "Diagnostiikka", "Viat ja live-data"],
    ["viritys", "ECU-viritys ja osat", "Ohjelmisto, imu, pako"],
    ["dyno", "Dyno-mittaus", "Teho- ja vääntökäyrä"],
    ["jarrut", "Jarrut ja alusta", "Levyt, jousitus, geometria"],
    ["kalvotus", "Kalvotus ja maalaus", "Väri ja suojakalvo"]
  ];
  var sel = [];
  try { sel = JSON.parse(sessionStorage.getItem("vg_services") || "[]"); } catch (e) {}
  var day = null, slot = null, step = 0;
  var opts = $("#svcOpts");
  opts.innerHTML = SVC.map(function (s) {
    return '<button class="opt" type="button" data-id="' + s[0] + '" aria-pressed="' + (sel.indexOf(s[0]) > -1) + '"><b>' + s[1] + '</b><span>' + s[2] + '</span></button>';
  }).join("");
  opts.addEventListener("click", function (e) {
    var b = e.target.closest(".opt"); if (!b) return;
    var i = sel.indexOf(b.dataset.id); i > -1 ? sel.splice(i, 1) : sel.push(b.dataset.id);
    b.setAttribute("aria-pressed", i === -1); $("#e0").textContent = "";
  });

  /* kalenteri: seuraavat 3 viikkoa, arkipäivät, deterministiset varatut ajat */
  var SLOTS = ["08:00", "09:30", "11:00", "12:30", "14:00", "15:30"];
  var DOW = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];
  var MON = ["tammi", "helmi", "maalis", "huhti", "touko", "kesä", "heinä", "elo", "syys", "loka", "marras", "joulu"];
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 100; }
  function key(d) { return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function free(d, t) { return hash(key(d) + t) > 34; }
  var cal = $("#cal"), start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() + 1);
  var first = (start.getDay() + 6) % 7, days = [];
  cal.innerHTML = DOW.map(function (d) { return '<div class="dow">' + d + '</div>'; }).join("");
  for (var i = 0; i < first; i++) cal.appendChild(document.createElement("span"));
  for (var n = 0; n < 21; n++) {
    var d = new Date(start); d.setDate(start.getDate() + n);
    var wk = (d.getDay() + 6) % 7, off = wk > 4;
    var any = !off && SLOTS.some(function (t) { return free(d, t); });
    var b = document.createElement("button"); b.type = "button"; b.className = "day"; b.disabled = !any;
    b.innerHTML = d.getDate() + "<small>" + MON[d.getMonth()] + "</small>"; b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", DOW[wk] + " " + d.getDate() + ". " + MON[d.getMonth()] + "kuuta");
    (function (btn, dd) { btn.addEventListener("click", function () { day = dd; slot = null; $$(".day", cal).forEach(function (x) { x.setAttribute("aria-pressed", x === btn); }); drawSlots(); $("#e2").textContent = ""; }); })(b, d);
    cal.appendChild(b);
  }
  function drawSlots() {
    var box = $("#slots"); box.innerHTML = "";
    SLOTS.forEach(function (t) {
      var s = document.createElement("button"); s.type = "button"; s.className = "slot"; s.textContent = t; s.disabled = !free(day, t); s.setAttribute("aria-pressed", "false");
      s.addEventListener("click", function () { slot = t; $$(".slot", box).forEach(function (x) { x.setAttribute("aria-pressed", x === s); }); $("#e2").textContent = ""; });
      box.appendChild(s);
    });
  }

  /* vaiheet */
  var panes = $$(".stp"), stp = $$("#stepper li"), back = $("#back"), next = $("#next");
  function names() { return SVC.filter(function (s) { return sel.indexOf(s[0]) > -1; }).map(function (s) { return s[1]; }); }
  function when() { return day ? DOW[(day.getDay() + 6) % 7] + " " + day.getDate() + ". " + MON[day.getMonth()] + "kuuta" + (slot ? " klo " + slot : "") : "–"; }
  function show(i) {
    step = i; panes.forEach(function (p, k) { p.hidden = k !== i; });
    stp.forEach(function (li, k) { li.className = k === i ? "on" : k < i ? "done" : ""; });
    back.hidden = i === 0; next.textContent = i === 3 ? "Vahvista varaus" : "Seuraava →";
    if (i === 3) {
      $("#sum").innerHTML = [["Palvelut", names().join(", ") || "–"], ["Auto", ($("#make").value || "–") + ($("#year").value ? " (" + $("#year").value + ")" : "")], ["Aika", when()]].map(function (r) { return "<div><span>" + r[0] + "</span><b>" + r[1].replace(/</g, "&lt;") + "</b></div>"; }).join("");
    }
    var h = $("h2", panes[i]); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    scrollTo({ top: 0, behavior: "smooth" });
  }
  function valid() {
    var ok = true;
    if (step === 0 && !sel.length) { $("#e0").textContent = "Valitse vähintään yksi palvelu."; ok = false; }
    if (step === 1 && !$("#make").value.trim()) { $("#e1").textContent = "Kerro auton merkki ja malli."; ok = false; } else if (step === 1) $("#e1").textContent = "";
    if (step === 2 && !(day && slot)) { $("#e2").textContent = "Valitse päivä ja kellonaika."; ok = false; }
    if (step === 3) {
      var em = $("#email").value.trim(), msg = "";
      if (!$("#name").value.trim()) msg = "Kirjoita nimesi.";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) msg = "Tarkista sähköpostiosoite.";
      else if (!$("#consent").checked) msg = "Hyväksy tietojen käsittely jatkaaksesi.";
      $("#e3").textContent = msg; if (msg) ok = false;
    }
    return ok;
  }
  next.addEventListener("click", function () {
    if (!valid()) return;
    if (step < 3) return show(step + 1);
    panes.forEach(function (p) { p.hidden = true; }); $("#navRow").hidden = true; $("#done").hidden = false;
    stp.forEach(function (li) { li.className = "done"; });
    $("#doneTxt").textContent = "Aikasi: " + when() + ". Palvelut: " + names().join(", ") + ". Vahvistus lähtisi osoitteeseen " + $("#email").value.trim() + ".";
    try { sessionStorage.removeItem("vg_services"); } catch (e) {}
    scrollTo({ top: 0, behavior: "smooth" });
  });
  back.addEventListener("click", function () { if (step > 0) show(step - 1); });
  $("#form").addEventListener("submit", function (e) { e.preventDefault(); });
})();
