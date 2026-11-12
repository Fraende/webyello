// Builds the site into dist/: Finnish pages at the root (the default), Swedish under /sv/, English under /en/.
//
// The page files in the repo root are the single source. Their markup is English and every
// translatable piece is tagged (data-i18n, data-i18n-ph, -aria, -alt, -content). Finnish text
// lives in i18n/fi.json and Swedish in i18n/sv.json. This script writes each page once per language,
// edits only the tagged spots (everything else stays byte-for-byte as written), and adds
// canonical/hreflang links, the FI/SV/EN switch targets, a sitemap and robots.txt.
// Vercel runs it on every deploy.
//
//   npm run build   -> dist/
//   npm run dev     -> build, then serve dist/ on http://localhost:4173

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { parse } from 'parse5';

const SITE = 'https://www.webyello.fi';
const OUT = 'dist';

// language -> URL prefix. Finnish is the default and lives at the root.
const LANGS = { fi: '', sv: '/sv', en: '/en' };
// translated strings per language; English is the source markup itself
const STR = {
  fi: JSON.parse(readFileSync('i18n/fi.json', 'utf8')),
  sv: JSON.parse(readFileSync('i18n/sv.json', 'utf8')),
};

// source file -> its path on the site (the other languages live at their prefix + path)
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
  'DESIGN.md', 'PRODUCT.md', 'README.md', 'CLAUDE.md', 'variants']);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// A link to one of the generated pages, rewritten for another language ("/pricing.html#quote" -> "/sv/pricing.html#quote")
const PAGE_LINK = /^\/(index\.html|services\.html|process\.html|pricing\.html|privacy\.html|demos\/(?:index\.html)?)?([?#].*)?$/;
const localize = (href, lang) => {
  if (!LANGS[lang]) return href;
  const m = href.match(PAGE_LINK);
  return m ? LANGS[lang] + '/' + (m[1] || '') + (m[2] || '') : href;
};
// links inside a translated string (e.g. the privacy link under the form)
const localizeHtml = (html, lang) => html.replace(/href="([^"]*)"/g, (_, h) => `href="${esc(localize(h, lang))}"`);

const used = { fi: new Set(), sv: new Set() };
const t = (lang, key) => {
  if (!(key in STR[lang])) throw new Error(`i18n/${lang}.json has no "${key}"`);
  used[lang].add(key);
  return STR[lang][key];
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

  const url = l => SITE + LANGS[l] + path;
  let head = null;

  (function walk(node) {
    for (const el of node.childNodes || []) {
      if (!el.tagName || !el.sourceCodeLocation) continue;
      if (inside(el.sourceCodeLocation)) continue;
      const cls = (attr(el, 'class') || '').split(/\s+/);

      // another language's block (privacy page)
      if (cls.some(c => /^l-[a-z]{2}$/.test(c) && c !== 'l-' + lang)) { remove(el); continue; }

      if (el.tagName === 'html') {
        setAttr(el, 'lang', lang);
        for (const l of Object.keys(LANGS)) dropAttr(el, 'data-title-' + l);
      }
      if (el.tagName === 'head') head = el;
      if (el.tagName === 'title') {
        const tt = attr(doc.childNodes.find(n => n.tagName === 'html'), 'data-title-' + lang);
        if (tt) setInner(el, escText(tt));
      }
      if (el.tagName === 'a') {
        const target = attr(el, 'data-lang');
        if (target) {
          // the language switch: a link to this same page in the other language
          if (!(target in LANGS)) throw new Error(`${src}: unknown data-lang="${target}"`);
          setAttr(el, 'href', LANGS[target] + path);
          if (target === lang) setAttr(el, 'aria-current', 'true');
        } else if (LANGS[lang] && attr(el, 'href')) {
          const h = attr(el, 'href'), n = localize(h, lang);
          if (n !== h) setAttr(el, 'href', n);
        }
      }
      if (lang !== 'en') {
        const k = attr(el, 'data-i18n');
        if (attr(el, 'data-i18n-ph')) setAttr(el, 'placeholder', t(lang, attr(el, 'data-i18n-ph')));
        if (attr(el, 'data-i18n-aria')) setAttr(el, 'aria-label', t(lang, attr(el, 'data-i18n-aria')));
        if (attr(el, 'data-i18n-alt')) setAttr(el, 'alt', t(lang, attr(el, 'data-i18n-alt')));
        if (attr(el, 'data-i18n-content')) setAttr(el, 'content', t(lang, attr(el, 'data-i18n-content')));
        if (k) { setInner(el, localizeHtml(t(lang, k), lang)); continue; }
      }
      walk(el);
    }
  })(doc);

  if (!head?.sourceCodeLocation.endTag) throw new Error(`${src}: no </head>`);
  edits.push({
    start: head.sourceCodeLocation.endTag.startOffset, end: head.sourceCodeLocation.endTag.startOffset,
    text: `<link rel="canonical" href="${url(lang)}">\n` +
      Object.keys(LANGS).map(l => `<link rel="alternate" hreflang="${l}" href="${url(l)}">\n`).join('') +
      `<link rel="alternate" hreflang="x-default" href="${url('fi')}">\n`,
  });

  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let out = html;
  let floor = Infinity;
  for (const e of edits) {
    if (e.end > floor) throw new Error(`${src} (${lang}): overlapping edits at ${e.start}`);
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
    floor = e.start;
  }
  return out;
}

function copyTree(from, to) {
  for (const name of readdirSync(from)) {
    if (name === '.DS_Store' || (from === '.' && (name.startsWith('.') || SKIP_ROOT.has(name)))) continue;
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
  for (const lang of Object.keys(LANGS)) {
    const file = join(OUT, LANGS[lang], src);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, render(src, path, lang));
  }
  urls.push(path);
}

for (const lang of Object.keys(STR)) {
  const unused = Object.keys(STR[lang]).filter(k => !used[lang].has(k));
  if (unused.length) console.warn(`${lang} strings not used on any page:`, unused.join(', '));
}
const fiKeys = Object.keys(STR.fi), svKeys = new Set(Object.keys(STR.sv));
const missing = fiKeys.filter(k => !svKeys.has(k));
if (missing.length) throw new Error('i18n/sv.json is missing: ' + missing.join(', '));

const alternates = p => Object.keys(LANGS).map(l =>
  `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE + LANGS[l] + p}"/>`).join('');
writeFileSync(join(OUT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  urls.flatMap(p => Object.values(LANGS).map(pre => `  <url><loc>${SITE + pre + p}</loc>${alternates(p)}</url>`)).join('\n') +
  '\n</urlset>\n');
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Built ${urls.length} pages × ${Object.keys(LANGS).length} languages into ${OUT}/`);
