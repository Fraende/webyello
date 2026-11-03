// Home page extras for the "Pop" look: pop-able bubbles on the poster and the looping ribbons.
// Everything here is decoration; the page reads and works the same without it.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ribbons: copy each group once so the track can slide by exactly half its width and loop.
  document.querySelectorAll('.rtrack').forEach(function (t) {
    var g = t.firstElementChild;
    if (g && g.children.length) t.appendChild(g.cloneNode(true));
  });

  var field = document.getElementById('popField');
  if (!field) return;
  var out = document.getElementById('popN');
  var popped = 0;
  var COLORS = ['gold', 'cream', 'blue', 'white'];
  var small = window.innerWidth < 640;
  var target = small ? 10 : Math.max(14, Math.min(28, Math.round(window.innerWidth / 55)));

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function make() {
    var b = document.createElement('span');
    var s = small ? rnd(14, 42) : rnd(18, 76);
    b.className = 'bub c-' + COLORS[Math.floor(Math.random() * COLORS.length)];
    b.style.width = b.style.height = s.toFixed(0) + 'px';
    b.style.left = rnd(1, 96).toFixed(1) + '%';
    b.style.top = rnd(4, 92).toFixed(1) + '%';
    b.style.setProperty('--d', rnd(3.5, 7).toFixed(1) + 's');
    b.style.setProperty('--w', (-rnd(0, 4)).toFixed(1) + 's');
    field.appendChild(b);
  }

  for (var i = 0; i < target; i++) make();

  field.addEventListener('pointerdown', function (e) {
    var b = e.target;
    if (!b.classList || !b.classList.contains('bub') || b.classList.contains('pop')) return;
    b.classList.add('pop');
    popped++;
    if (out) out.textContent = popped;
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, reduce ? 120 : 340);
    setTimeout(make, 900);
  });
})();
