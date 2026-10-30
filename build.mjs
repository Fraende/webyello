// Builds the site into dist/: Finnish pages at the root, English pages under /en/.
//
// The page files in the repo root are the single source. Their markup is English and every
// translatable piece is tagged (data-i18n, data-i18n-ph, -aria, -alt, -content). Finnish text
// lives in i18n/fi.json. This script writes each page twice, edits only the tagged spots
// (everything else stays byte-for-byte as written), and adds canonical/hreflang links,
// the FI/EN switch targets, a sitemap and robots.txt. Vercel runs it on every deploy.
//
//   npm run build   -> dist/
//   npm run dev     -> build, then serve dist/ on http://localhost:4173

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { parse } from 'parse5';

const SITE = 'https://www.webyello.fi';
const OUT = 'dist';
const FI = JSON.parse(readFileSync('i18n/fi.json', 'utf8'));

// source file -> its path on the site (the English copy lives at /en + path)
const PAGES = {
  'index.html': '/',
  'services.html': '/services.html',
  'process.html': '/process.html',
  'pricing.html': '/pricing.html',
  'privacy.html': '/privacy.html',
  'demos/index.html': '/demos/',
};

// never copied into dist: tooling, sources and internal docs at the repo root (folders such as demos/ are copied as they are)
const SKIP_ROOT = new Set(['.git', '.github', 'node_modules', OUT, 'api', 'i18n', 'build.mjs', 'package.json',
  'package-lock.json', 'vercel.json', '.gitignore', '.vercelignore', '.impeccable', '.claude',
  'DESIGN.md', 'PRODUCT.md', 'README.md', 'CLAUDE.md']);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// A link to one of the generated pages, rewritten for the English copy ("/pricing.html#quote" -> "/en/pricing.html#quote")
const PAGE_LINK = /^\/(index\.html|services\.html|process\.html|pricing\.html|privacy\.html|demos\/(?:index\.html)?)?([?#].*)?$/;
const toEnglish = href => {
  const m = href.match(PAGE_LINK);
  return m ? '/en/' + (m[1] || '') + (m[2] || '') : href;
};

const used = new Set();
const fi = key => {
  if (!(key in FI)) throw new Error(`i18n/fi.json has no "${key}"`);
  used.add(key);
  return FI[key];
};

function render(src, path, lang) {
  const html = readFileSync(src, 'utf8');
  const doc = parse(html, { sourceCodeLocationInfo: true });
  const edits = [];            // {start, end, text}
  const replaced = [];         // ranges whose contents were swapped out; nothing inside them is edited
  const inside = loc => replaced.some(r => loc.startOffset >= r[0] && loc.endOffset <= r[1]);
  const attr = (el, name) => el.attrs.find(a => a.name === name)?.value;
  const loc = (el, name) => el.sourceCodeLocation.attrs?.[name];

  const setAttr = (el, name, value) => {
    const l = loc(el, name);
    const text = `${name}="${esc(value)}"`;
    if (l) edits.push({ start: l.startOffset, end: l.endOffset, text });
    else {
      const st = el.sourceCodeLocation.startTag;
      const at = html[st.endOffset - 2] === '/' ? st.endOffset - 2 : st.endOffset - 1;
      edits.push({ start: at, end: at, text: ' ' + text });
    }
  };
  const dropAttr = (el, name) => {
    const l = loc(el, name);
    if (!l) return;
    let s = l.startOffset;
    while (/\s/.test(html[s - 1])) s--;
    edits.push({ start: s, end: l.endOffset, text: '' });
  };
  const setInner = (el, text) => {
    const { startTag, endTag } = el.sourceCodeLocation;
    if (!endTag) throw new Error(`${src}: <${el.tagName}> has no closing tag`);
    edits.push({ start: startTag.endOffset, end: endTag.startOffset, text });
    replaced.push([startTag.endOffset, endTag.startOffset]);
  };
  const remove = el => {
    const { startOffset, endOffset } = el.sourceCodeLocation;
    let s = startOffset;
    while (s > 0 && (html[s - 1] === ' ' || html[s - 1] === '\t')) s--;
    let e = endOffset;
    if (html[e] === '\n') e++;
    edits.push({ start: s, end: e, text: '' });
    replaced.push([s, e]);
  };

  const fiUrl = SITE + path, enUrl = SITE + '/en' + path;
  const here = lang === 'fi' ? path : '/en' + path;
  let head = null;

  (function walk(node) {
    for (const el of node.childNodes || []) {
      if (!el.tagName || !el.sourceCodeLocation) continue;
      if (inside(el.sourceCodeLocation)) continue;
      const cls = (attr(el, 'class') || '').split(/\s+/);

      // the other language's block (privacy page)
      if (cls.includes(lang === 'fi' ? 'l-en' : 'l-fi')) { remove(el); continue; }

      if (el.tagName === 'html') {
        setAttr(el, 'lang', lang);
        dropAttr(el, 'data-title-en'); dropAttr(el, 'data-title-fi');
      }
      if (el.tagName === 'head') head = el;
      if (el.tagName === 'title') {
        const t = attr(doc.childNodes.find(n => n.tagName === 'html'), lang === 'fi' ? 'data-title-fi' : 'data-title-en');
        if (t) setInner(el, escText(t));
      }
      if (lang === 'fi') {
        const k = attr(el, 'data-i18n');
        if (attr(el, 'data-i18n-ph')) setAttr(el, 'placeholder', fi(attr(el, 'data-i18n-ph')));
        if (attr(el, 'data-i18n-aria')) setAttr(el, 'aria-label', fi(attr(el, 'data-i18n-aria')));
        if (attr(el, 'data-i18n-alt')) setAttr(el, 'alt', fi(attr(el, 'data-i18n-alt')));
        if (attr(el, 'data-i18n-content')) setAttr(el, 'content', fi(attr(el, 'data-i18n-content')));
        if (k) { setInner(el, fi(k)); continue; }
      }
      if (el.tagName === 'a') {
        const target = attr(el, 'data-lang');
        if (target) {
          // the FI/EN switch: a link to this same page in the other language
          setAttr(el, 'href', target === 'fi' ? path : '/en' + path);
          if (target === lang) setAttr(el, 'aria-current', 'true');
        } else if (lang === 'en' && attr(el, 'href')) {
          const h = attr(el, 'href'), n = toEnglish(h);
          if (n !== h) setAttr(el, 'href', n);
        }
      }
      walk(el);
    }
  })(doc);

  if (!head?.sourceCodeLocation.endTag) throw new Error(`${src}: no </head>`);
  edits.push({
    start: head.sourceCodeLocation.endTag.startOffset, end: head.sourceCodeLocation.endTag.startOffset,
    text: `<link rel="canonical" href="${lang === 'fi' ? fiUrl : enUrl}">\n` +
      `<link rel="alternate" hreflang="fi" href="${fiUrl}">\n` +
      `<link rel="alternate" hreflang="en" href="${enUrl}">\n` +
      `<link rel="alternate" hreflang="x-default" href="${fiUrl}">\n`,
  });

  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let out = html;
  let floor = Infinity;
  for (const e of edits) {
    if (e.end > floor) throw new Error(`${src} (${lang}): overlapping edits at ${e.start}`);
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    floor = e.start;
  }
  return { out, here };
}

function copyTree(from, to) {
  for (const name of readdirSync(from)) {
    if (name === '.DS_Store' || (from === '.' && SKIP_ROOT.has(name))) continue;
    const s = join(from, name), d = join(to, name);
    if (from === '.' && name in PAGES) continue;
    if (statSync(s).isDirectory()) { mkdirSync(d, { recursive: true }); copyTree(s, d); }
    else if (!(join(from, name).replace(/^\.\//, '') in PAGES)) copyFileSync(s, d);
  }
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
copyTree('.', OUT);

const urls = [];
for (const [src, path] of Object.entries(PAGES)) {
  for (const lang of ['fi', 'en']) {
    const { out } = render(src, path, lang);
    const file = join(OUT, lang === 'en' ? 'en' : '', src);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, out);
  }
  urls.push(path);
}

const unused = Object.keys(FI).filter(k => !used.has(k));
if (unused.length) console.warn('Finnish strings not used on any page:', unused.join(', '));

writeFileSync(join(OUT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  urls.flatMap(p => [SITE + p, SITE + '/en' + p].map(u =>
    `  <url><loc>${u}</loc>` +
    `<xhtml:link rel="alternate" hreflang="fi" href="${SITE + p}"/>` +
    `<xhtml:link rel="alternate" hreflang="en" href="${SITE + '/en' + p}"/></url>`)).join('\n') +
  '\n</urlset>\n');
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Built ${urls.length} pages × 2 languages into ${OUT}/`);
