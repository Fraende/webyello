(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- morning / night ---------- */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var lede = document.getElementById("lede");
  var ledeText = {
    morning: "Aamurusko suunnittelee ja asentaa aurinkosähköjärjestelmiä suomalaisiin koteihin. Päivällä katto tuottaa, illalla ja yöllä akku jatkaa.",
    night: "Kun aurinko laskee, akku ottaa vastuun. Valot, lämmitys ja sähköauto saavat päivällä kerätyn sähkön, ja verkosta otetaan vain puuttuva osa."
  };
  var buttons = document.querySelectorAll(".toggle button");

  function setScene(scene, save) {
    root.setAttribute("data-scene", scene);
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.set === scene)); });
    if (themeMeta) themeMeta.setAttribute("content", scene === "night" ? "#0D1117" : "#F4F2EC");
    if (lede) lede.textContent = ledeText[scene];
    if (save) { try { localStorage.setItem("aamurusko-scene", scene); } catch (e) {} }
  }
  setScene(root.getAttribute("data-scene") || "morning", false);
  buttons.forEach(function (b) { b.addEventListener("click", function () { setScene(b.dataset.set, true); }); });

  /* ---------- header + mobile menu ---------- */
  var bar = document.getElementById("bar");
  function onScroll() { bar.classList.toggle("solid", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Sulje valikko" : "Avaa valikko");
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1024) setMenu(false); });

  /* ---------- reveal on scroll ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- quote form (front-end only: nothing is sent anywhere) ---------- */
  var form = document.getElementById("quote");
  var status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = [];
      ["f-name", "f-email", "f-city"].forEach(function (id) {
        var el = document.getElementById(id);
        var ok = el.value.trim() !== "" && (id !== "f-email" || /^\S+@\S+\.\S+$/.test(el.value.trim()));
        el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok) bad.push(el);
      });
      if (bad.length) {
        status.textContent = "Tarkista merkityt kentät.";
        bad[0].focus();
        return;
      }
      status.textContent = "Kiitos! Tarjouspyyntö on vastaanotettu. Otamme yhteyttä yhden arkipäivän kuluessa.";
      form.reset();
    });
  }
})();
