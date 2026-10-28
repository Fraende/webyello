/* Animated "Mesh drift" background (21st.dev Shader Builder), plain WebGL1, no libraries.
   One fixed canvas behind every page. Pauses when the tab is hidden; draws a single still
   frame when the visitor prefers reduced motion; does nothing if WebGL is unavailable. */
(function(){
  var FRAG = "// \"Mesh drift\" \u2014 made with the 21st.dev Shader Builder\n// Packed WebGL1 uniforms (the shader exposes readable u_* aliases as macros):\n//   u_colors[8] (first 4 used)\n//   vec3(0.137, 0.102, 0.063)\n//   vec3(0.643, 0.443, 0.282)\n//   vec3(0.890, 0.710, 0.529)\n//   vec3(0.976, 0.945, 0.906)\n//   u_scene = vec4(canvas width, canvas height, seconds * 0.57, 4.0)\n//   u_shape = vec4(2.10, 0.51, 0.50, 0.08)\n//   u_surface = vec4(2.21, 0.98, 0.08, 1.28)\n//   u_finish = vec4(6.00, 0.12, 0.009, 0.10)\n//   u_transform = vec4(7338.0, 1.78, 0.01, 1.0)\n//   u_space = vec4(-0.17, -0.05, pointer x, pointer y)\n//   u_cursor = vec4(presence, 3.0, 0.38, 0.51)\n\n#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n\nuniform vec3 u_colors[8];\n// Seven packed vectors + eight colour vectors = 15 fragment uniform vectors,\n// one below WebGL1's guaranteed minimum. Macros preserve the public u_* API.\nuniform vec4 u_scene;      // resolution.xy, time, colour count\nuniform vec4 u_shape;      // scale, intensity, paramA, warp\nuniform vec4 u_surface;    // detail, contrast, brightness, saturation\nuniform vec4 u_finish;     // hue, vignette, blur, grain\nuniform vec4 u_transform;  // seed, rotation, drift, OKLab toggle\nuniform vec4 u_space;      // offset.xy, pointer.xy\nuniform vec4 u_cursor;\n\n#define u_resolution u_scene.xy\n#define u_time u_scene.z\n#define u_colorCount u_scene.w\n#define u_scale u_shape.x\n#define u_intensity u_shape.y\n#define u_paramA u_shape.z\n#define u_warp u_shape.w\n#define u_detail u_surface.x\n#define u_contrast u_surface.y\n#define u_brightness u_surface.z\n#define u_saturation u_surface.w\n#define u_hue u_finish.x\n#define u_vignette u_finish.y\n#define u_blur u_finish.z\n#define u_grain u_finish.w\n#ifdef GL_FRAGMENT_PRECISION_HIGH\n#define u_seed u_transform.x\n#else\n// Keep hash inputs inside mediump's guaranteed \u00b12^14 range.\n#define u_seed mod(u_transform.x, 31.0)\n#endif\n#define u_rotate u_transform.y\n#define u_drift u_transform.z\n#define u_oklab u_transform.w\n#define u_offset u_space.xy\n#define u_mouse u_space.zw\n#define u_cursorPresence u_cursor.x\n#define u_cursorEffect u_cursor.y\n#define u_cursorStrength u_cursor.z\n#define u_cursorRadius u_cursor.w\n\nfloat hash21(vec2 p) {\n#ifndef GL_FRAGMENT_PRECISION_HIGH\n  p = mod(p, 31.0);\n#endif\n  p = fract(p * vec2(234.34, 435.345));\n  p += dot(p, p + 34.23);\n  return fract(p.x * p.y);\n}\n\n// Even, un-structured white noise for film grain (Dave Hoskins hash12). The\n// multiply hash above is fine for value noise but shows a faint axis-aligned\n// mesh at integer fragment coords, which reads as a net over flat areas.\nfloat grainHash(vec2 p) {\n  vec3 p3 = fract(vec3(p.xyx) * 0.1031);\n  p3 += dot(p3, p3.yzx + 33.33);\n  return fract((p3.x + p3.y) * p3.z);\n}\n\nvec2 hash22(vec2 p) {\n#ifndef GL_FRAGMENT_PRECISION_HIGH\n  p = mod(p, 31.0);\n#endif\n  float n = sin(dot(p, vec2(41.0, 289.0)));\n  return fract(vec2(15731.743, 7892.321) * n);\n}\n\nfloat noise(vec2 p) {\n  vec2 i = floor(p);\n  vec2 f = fract(p);\n  vec2 u = f * f * (3.0 - 2.0 * f);\n  return mix(\n    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),\n    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),\n    u.y);\n}\n\nfloat fbm(vec2 p) {\n  float v = 0.0;\n  float a = 0.5;\n  for (int i = 0; i < 5; i++) {\n    v += a * noise(p);\n    p = p * 2.03 + vec2(17.0, 9.2);\n    a *= 0.5;\n  }\n  return v;\n}\n\n// --- OKLab colour mixing (perceptual), gated by u_oklab -----------------------\nvec3 srgbToLinear(vec3 c) {\n  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)),\n    step(0.04045, c));\n}\nvec3 linearToSrgb(vec3 c) {\n  // max() guards the sRGB branch: out-of-gamut OKLab interpolations can send a\n  // channel negative, and pow(negative, \u2026) is NaN which mix()/step() would\n  // then propagate. The linear branch clips such channels to 0 downstream.\n  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,\n    step(0.0031308, c));\n}\nvec3 linToOklab(vec3 c) {\n  float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;\n  float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;\n  float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;\n  l = pow(max(l, 0.0), 1.0 / 3.0);\n  m = pow(max(m, 0.0), 1.0 / 3.0);\n  s = pow(max(s, 0.0), 1.0 / 3.0);\n  return vec3(\n    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,\n    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,\n    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);\n}\nvec3 oklabToLin(vec3 c) {\n  float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;\n  float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;\n  float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;\n  l = l * l * l; m = m * m * m; s = s * s * s;\n  return vec3(\n    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,\n    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,\n    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);\n}\nvec3 mixColour(vec3 a, vec3 b, float t) {\n  if (u_oklab > 0.5) {\n    vec3 la = linToOklab(srgbToLinear(a));\n    vec3 lb = linToOklab(srgbToLinear(b));\n    return clamp(linearToSrgb(oklabToLin(mix(la, lb, t))), 0.0, 1.0);\n  }\n  return mix(a, b, t);\n}\n\n// Mix through the recipe colours; x is clamped to 0..1. WebGL1 forbids\n// dynamic uniform indexing in fragment shaders, hence the constant loop.\nvec3 palette(float x) {\n  float n = max(u_colorCount - 1.0, 1.0);\n  float f = clamp(x, 0.0, 1.0) * n;\n  vec3 col = u_colors[0];\n  for (int i = 0; i < 7; i++) {\n    if (float(i) < n)\n      col = mixColour(col, u_colors[i + 1],\n        smoothstep(0.0, 1.0, clamp(f - float(i), 0.0, 1.0)));\n  }\n  return col;\n}\n\nvec3 hueRotate(vec3 col, float a) {\n  const mat3 toYIQ = mat3(0.299, 0.596, 0.211,\n                          0.587, -0.274, -0.523,\n                          0.114, -0.322, 0.312);\n  const mat3 toRGB = mat3(1.0, 1.0, 1.0,\n                          0.956, -0.272, -1.106,\n                          0.621, -0.647, 1.703);\n  vec3 yiq = toYIQ * col;\n  float ca = cos(a), sa = sin(a);\n  yiq = vec3(yiq.x, yiq.y * ca - yiq.z * sa, yiq.y * sa + yiq.z * ca);\n  return toRGB * yiq;\n}\n\nvec3 shade(vec2 uv, vec2 p, float t) {\n  vec3 acc = u_colors[0] * 0.15;\n  float total = 0.15;\n  for (int i = 0; i < 8; i++) {\n    if (float(i) >= u_colorCount) break;\n    float fi = float(i);\n    vec2 c = vec2(\n      sin(t * (0.21 + fi * 0.071) + fi * 2.4 + u_seed),\n      cos(t * (0.17 + fi * 0.093) + fi * 1.7)) * (0.45 + u_intensity * 0.35);\n    float w = exp(-dot(p - c, p - c) * 6.0);\n    acc += u_colors[i] * w;\n    total += w;\n  }\n  return acc / total;\n}\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n  vec2 screenUv = uv;\n  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)\n    / min(u_resolution.x, u_resolution.y);\n  float cursorMask = 0.0;\n\n  // Cursor modes 1\u20133 are local distortions. Push shifts the same screen-space\n  // coordinates before field transforms, so Zoom/Rotate don't change its feel.\n  if (u_cursorPresence > 0.001) {\n    // u_mouse is normalized to -1..1 in canvas space. Convert it to the same\n    // aspect-corrected screen space as p so effects stay under the cursor.\n    vec2 cursor = (0.5 * u_mouse * u_resolution.xy)\n      / min(u_resolution.x, u_resolution.y);\n    vec2 cursorDelta = p - cursor;\n    if (u_cursorEffect < 0.5) {\n      p += cursor * u_cursorPresence * u_cursorStrength * 0.55;\n    } else {\n      float cursorDistance = length(cursorDelta);\n      vec2 cursorDirection = cursorDelta / max(cursorDistance, 0.0001);\n      cursorMask = u_cursorPresence\n        * (1.0 - smoothstep(0.0, u_cursorRadius, cursorDistance));\n      if (u_cursorEffect < 1.5) {\n        p -= cursorDirection * cursorMask * u_cursorStrength * 0.24;\n      } else if (u_cursorEffect < 2.5) {\n        float cursorAngle = cursorMask * u_cursorStrength * 2.2;\n        float cc = cos(cursorAngle), cs = sin(cursorAngle);\n        p = cursor + mat2(cc, -cs, cs, cc) * cursorDelta;\n      } else if (u_cursorEffect < 3.5) {\n        float ripple = sin(\n          cursorDistance / max(u_cursorRadius, 0.001) * 18.0 - u_time * 5.0);\n        p -= cursorDirection * ripple * cursorMask * u_cursorStrength * 0.07;\n      }\n    }\n  }\n\n  // Keep presets that read uv (rather than p) in the same warped space.\n  uv = p * min(u_resolution.x, u_resolution.y) / u_resolution.xy + 0.5;\n  p *= u_scale;\n  // Field transform: rotate, pan, pointer push, slow drift.\n  if (abs(u_rotate) > 0.0001) {\n    float cr = cos(u_rotate), sr = sin(u_rotate);\n    p = mat2(cr, -sr, sr, cr) * p;\n  }\n  p += u_offset;\n  if (u_drift > 0.0001)\n    p += u_drift * vec2(sin(u_time * 0.31), cos(u_time * 0.23));\n  // Organic domain warp.\n  if (u_warp > 0.0) {\n    p += u_warp * (vec2(\n      fbm(p * u_detail + u_seed),\n      fbm(p * u_detail + vec2(5.2, 1.3))) - 0.5);\n  }\n  // Shade, with an optional soft 5-tap blur.\n  vec3 col;\n  if (u_blur > 0.0) {\n    float e = u_blur;\n    float pe = e * u_scale;\n    vec2 uvE = vec2(e) * min(u_resolution.x, u_resolution.y) / u_resolution.xy;\n    col  = shade(uv, p, u_time) * 0.36;\n    col += shade(uv + vec2(uvE.x, 0.0), p + vec2(pe, 0.0), u_time) * 0.16;\n    col += shade(uv - vec2(uvE.x, 0.0), p - vec2(pe, 0.0), u_time) * 0.16;\n    col += shade(uv + vec2(0.0, uvE.y), p + vec2(0.0, pe), u_time) * 0.16;\n    col += shade(uv - vec2(0.0, uvE.y), p - vec2(0.0, pe), u_time) * 0.16;\n  } else {\n    col = shade(uv, p, u_time);\n  }\n  // Post: contrast, saturation, hue, brightness, vignette, grain.\n  if (abs(u_contrast - 1.0) > 0.0001)\n    col = (col - 0.5) * u_contrast + 0.5;\n  if (abs(u_saturation - 1.0) > 0.0001) {\n    float luma = dot(col, vec3(0.299, 0.587, 0.114));\n    col = mix(vec3(luma), col, u_saturation);\n  }\n  if (abs(u_hue) > 0.0001)\n    col = hueRotate(col, u_hue);\n  if (abs(u_brightness) > 0.0001)\n    col += u_brightness;\n  if (u_vignette > 0.0001) {\n    float vd = length(screenUv - 0.5) * 1.41421356;\n    col *= 1.0 - u_vignette * smoothstep(0.35, 1.0, vd);\n  }\n  if (u_cursorPresence > 0.001 && u_cursorEffect > 3.5)\n    col += (vec3(0.18) + col * 0.12) * cursorMask * u_cursorStrength;\n  if (u_grain > 0.0001)\n    col += (grainHash(\n      gl_FragCoord.xy + vec2(u_seed * 17.0, u_seed * 31.0)) - 0.5) * u_grain;\n  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);\n}\n";
  var VERT = 'attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}';

  var canvas = document.createElement('canvas');
  canvas.className = 'bg-shader';
  canvas.setAttribute('aria-hidden', 'true');
  var gl = canvas.getContext('webgl', {antialias:false, alpha:false, depth:false, stencil:false, preserveDrawingBuffer:false, powerPreference:'low-power'});
  if (!gl) return;

  function compile(type, src){
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('[bg-shader]', gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('[bg-shader]', gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);

  // Fullscreen triangle
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'a_pos'); gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var U = {}; ['u_colors','u_scene','u_shape','u_surface','u_finish','u_transform','u_space','u_cursor'].forEach(function(n){ U[n] = gl.getUniformLocation(prog, n); });

  // Recipe: colours #231A10 #A47148 #E3B587 #F9F1E7 (first 4 of 8 used), values exactly as exported
  var colors = new Float32Array(24);
  colors.set([0.137,0.102,0.063, 0.643,0.443,0.282, 0.890,0.710,0.529, 0.976,0.945,0.906]);
  gl.uniform3fv(U.u_colors, colors);
  gl.uniform4f(U.u_shape, 2.10, 0.51, 0.50, 0.08);
  gl.uniform4f(U.u_surface, 2.21, 0.98, 0.08, 1.28);
  gl.uniform4f(U.u_finish, 6.00, 0.12, 0.009, 0.10);
  gl.uniform4f(U.u_transform, 7338.0, 1.78, 0.01, 1.0);

  document.body.insertBefore(canvas, document.body.firstChild);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0;
  function resize(){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(window.innerWidth * dpr)), h = Math.max(1, Math.round(window.innerHeight * dpr));
    if (w !== W || h !== H) { W = canvas.width = w; H = canvas.height = h; gl.viewport(0, 0, W, H); }
  }

  // Cursor ripple: pointer in -1..1 canvas space (y up), presence eases in on movement and out when idle
  var px = 0, py = 0, presence = 0, target = 0, lastMove = 0;
  if (!reduce) {
    window.addEventListener('pointermove', function(e){
      if (e.pointerType === 'touch') return;
      px = e.clientX / window.innerWidth * 2 - 1;
      py = 1 - e.clientY / window.innerHeight * 2;
      target = 1; lastMove = performance.now();
    }, {passive:true});
    document.documentElement.addEventListener('pointerleave', function(){ target = 0; });
  }

  var start = performance.now(), raf = 0, prev = start;
  function frame(now){
    resize();
    var dt = Math.min((now - prev) / 1000, 0.1); prev = now;
    if (now - lastMove > 1800) target = 0;
    presence += (target - presence) * Math.min(1, dt * 4);
    var t = reduce ? 12.0 : (now - start) / 1000;
    gl.uniform4f(U.u_scene, W, H, t * 0.57, 4.0);
    gl.uniform4f(U.u_space, -0.17, -0.05, px, py);
    gl.uniform4f(U.u_cursor, presence, 3.0, 0.38, 0.51);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduce && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function play(){ if (!raf && !document.hidden) { prev = performance.now(); raf = requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', function(){
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!reduce) play();
  });
  window.addEventListener('resize', function(){ if (reduce) frame(performance.now()); }, {passive:true});
  canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); cancelAnimationFrame(raf); raf = 0; });

  if (reduce) frame(performance.now()); else play();
  document.documentElement.classList.add('has-bg-shader');
})();
