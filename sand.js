// Hero sand: the desert floor of the home hero, drawn as a slow-moving WebGL grain field.
//
// It sits under the illustration on the sand band (see .hero-sand in style.css) and replaces the
// flat CSS sand only once it has drawn its first frame, so without WebGL nothing changes.
// Wind ripples run in perspective (finer toward the horizon), with a fixed stipple on top that
// echoes the drawing's grain. The palette is sampled from the drawing and averages to --sand,
// and its darkest pixel keeps the hero text at 4.8:1 or better.
//
// Cost: one fragment shader on one canvas, capped at 30 fps and about one million pixels.
// It stops when the hero is off screen or the tab is hidden; with prefers-reduced-motion it
// draws one still frame and stops.
//
// Grain and colour ideas adapted from Paper Shaders' Grain Gradient
// (https://shaders.paper.design/grain-gradient), Apache-2.0.
(() => {
  const canvas = document.querySelector('.hero-sand');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return;

  const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_c0, u_c1, u_c2;

float hash(vec2 p){ p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
float stipple(vec2 p){ vec3 q = fract(vec3(p.xyx) * .1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(17., 9.2); a *= .5; }
  return v;
}
void main(){
  vec2 fc = gl_FragCoord.xy;
  float y = fc.y / u_res.y;                              // 0 at the bottom, 1 at the horizon
  float x = (fc.x - .5 * u_res.x) / u_res.y;
  float z = 1. / (1. - .8 * y);                          // depth: 1 up close, 5 at the horizon
  vec2 g = vec2(x * z, z * 2.2);
  float t = u_time;
  g.x += t * .1;                                          // wind drift
  float w = fbm(g * vec2(.9, 1.6) + vec2(0., t * .03));
  float ripple = sin(g.y * 7. + w * 5. + g.x * .6 - t * .45);
  float far = smoothstep(.55, 1., y);                    // calm the ripples before they alias
  float v = .5 + .2 * ripple * (1. - far) + .5 * (w - .5) * (1. - .5 * far);
  float coarse = hash(floor(fc / 2.)) - .5;              // grains a little bigger than a pixel
  v = clamp(v + coarse * .18, 0., 1.);
  vec3 col = v < .5 ? mix(u_c0, u_c1, v * 2.) : mix(u_c1, u_c2, v * 2. - 1.);
  col += (stipple(fc) - .5) * .07;                       // fixed fine stipple, like the drawing
  gl_FragColor = vec4(col, 1.);
}`;

  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  // Ripple shadow → --sand (#f3ca7b) → sunlit crest
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  gl.uniform3fv(gl.getUniformLocation(prog, 'u_c0'), rgb('#e9bf6d'));
  gl.uniform3fv(gl.getUniformLocation(prog, 'u_c1'), rgb('#f3ca7b'));
  gl.uniform3fv(gl.getUniformLocation(prog, 'u_c2'), rgb('#f7d690'));
  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');

  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true, raf = 0, last = 0, drawn = false;
  const start = performance.now();

  const size = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return false;          // hidden (phones) or not laid out yet
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const k = Math.min(1, Math.sqrt(1e6 / (r.width * r.height * dpr * dpr)));
    const w = Math.round(r.width * dpr * k), h = Math.round(r.height * dpr * k);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); drawn = false; }
    return true;
  };

  const draw = now => {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, still.matches ? 6 : (now - start) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    drawn = true;
    canvas.classList.add('is-live');
  };

  const frame = now => {
    raf = 0;
    if (!inView || document.hidden || !size()) return;
    if (still.matches) { if (!drawn) draw(now); return; }
    if (now - last >= 33) { last = now; draw(now); }  // ~30 fps is plenty for drifting sand
    raf = requestAnimationFrame(frame);
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };

  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) go(); }).observe(canvas);
  new ResizeObserver(go).observe(canvas);
  document.addEventListener('visibilitychange', go);
  still.addEventListener('change', () => { drawn = false; go(); });
  // Start after the page has painted, so the hero text and illustration come first.
  ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(go);
})();
