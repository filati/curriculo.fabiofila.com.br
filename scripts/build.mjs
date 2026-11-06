#!/usr/bin/env node
// Gera as páginas derivadas do site (nenhuma dependência; Node >= 18):
//   - en/index.html                     versão em inglês da home (a partir de index.html + scripts/i18n/home.en.json)
//   - devtools/**, en/devtools/**       uma página por ferramenta + índice, em PT e EN
//                                       (a partir de scripts/src/*.html, scripts/tools.mjs e scripts/i18n/dev.en.json)
//   - sitemap.xml                       com hreflang entre PT e EN
//
// Uso:  node scripts/build.mjs           grava os arquivos
//       node scripts/build.mjs --check   só confere se estão em dia (sai com 1 se não estiverem)
//
// index.html (PT) continua sendo editado à mão; os arquivos gerados NÃO devem ser editados.

import fs from "node:fs";
import path from "node:path";
import { tools, groups } from "./tools.mjs";

const SITE = "https://curriculo.fabiofila.com.br";
const OG_IMAGE = SITE + "/assets/og-image.png";
const root = path.resolve(import.meta.dirname, "..");
const CHECK = process.argv.includes("--check");

const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const readJson = (p) => JSON.parse(read(p));
const stale = [];
const warnings = [];
const sitemapEntries = [];

function emit(file, content) {
  const full = path.join(root, file);
  if (CHECK) {
    const cur = fs.existsSync(full) ? fs.readFileSync(full, "utf8") : null;
    if (cur !== content) stale.push(file);
    return;
  }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

/* ---------- utilidades de texto / HTML ---------- */
const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => escHtml(s).replace(/"/g, "&quot;");
const jsonLd = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n  </script>`;

// Troca o innerHTML de cada [data-i18n="chave"] pelo valor do dicionário (sem DOM: conta abre/fecha da mesma tag).
function applyI18n(html, dict, label) {
  const re = /<([a-zA-Z][\w-]*)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>/g;
  let out = "", pos = 0, m;
  while ((m = re.exec(html))) {
    const [open, tag, key] = m;
    const innerStart = m.index + open.length;
    const tagRe = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
    tagRe.lastIndex = innerStart;
    let depth = 1, innerEnd = -1, t;
    while ((t = tagRe.exec(html))) {
      if (t[1]) { if (--depth === 0) { innerEnd = t.index; break; } }
      else if (!t[0].endsWith("/>")) depth++;
    }
    if (innerEnd < 0) throw new Error(`Tag <${tag}> sem fechamento (data-i18n="${key}")`);
    if (dict[key] == null) warnings.push(`${label}: falta tradução EN para "${key}"`);
    out += html.slice(pos, m.index) + open + (dict[key] != null ? dict[key] : html.slice(innerStart, innerEnd));
    pos = innerEnd;
    re.lastIndex = innerEnd;
  }
  return out + html.slice(pos);
}

function applyAria(html, dict, label) {
  return html.replace(/<[^>]*\sdata-i18n-aria="([^"]+)"[^>]*>/g, (tag, key) => {
    if (dict[key] == null) { warnings.push(`${label}: falta tradução EN para "${key}" (aria)`); return tag; }
    return tag.replace(/aria-label="[^"]*"/, `aria-label="${escAttr(dict[key])}"`);
  });
}

const stripI18nAttrs = (html) => html.replace(/\sdata-i18n(-aria)?="[^"]*"/g, "");

function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${name.replace(/[.:]/g, "\\$&")}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`<meta ${attr}="${name}"> não encontrada`);
  return html.replace(re, (_, a, b) => a + escAttr(value) + b);
}

// URL relativa entre duas páginas do site (ambas no formato "/a/b/")
function relUrl(from, to) {
  const f = from.split("/").filter(Boolean), t = to.split("/").filter(Boolean);
  let i = 0;
  while (i < f.length && i < t.length && f[i] === t[i]) i++;
  return "../".repeat(f.length - i) + t.slice(i).map((x) => x + "/").join("") || "./";
}

const urlToFile = (url) => url.slice(1) + "index.html";

/* ====================================================================
   1) Home em inglês
   ==================================================================== */
const homeEn = readJson("scripts/i18n/home.en.json");
const HOME_PT = "/", HOME_EN = "/en/";

const hreflangs = (pt, en) =>
  `<link rel="alternate" hreflang="pt-BR" href="${SITE}${pt}" />\n  <link rel="alternate" hreflang="en" href="${SITE}${en}" />\n  <link rel="alternate" hreflang="x-default" href="${SITE}${pt}" />`;

function buildHomeEn() {
  let h = read("index.html");
  h = applyI18n(h, homeEn, "home");
  h = applyAria(h, homeEn, "home");
  h = stripI18nAttrs(h);
  h = h.replace('<html lang="pt-BR">', '<html lang="en">');
  h = h.replace(/\s*<script id="lang-redirect">.*?<\/script>/s, "");
  // <head>
  h = h.replace(/<title>.*?<\/title>/s, `<title>${escHtml(homeEn["meta.title"])}</title>`);
  h = setMeta(h, "name", "description", homeEn["meta.description"]);
  h = setMeta(h, "property", "og:title", homeEn["meta.title"]);
  h = setMeta(h, "property", "og:description", homeEn["meta.ogDescription"]);
  h = setMeta(h, "property", "og:locale", "en_US");
  h = setMeta(h, "property", "og:locale:alternate", "pt_BR");
  h = setMeta(h, "property", "og:url", SITE + HOME_EN);
  h = setMeta(h, "property", "og:image:alt", homeEn["meta.ogImageAlt"]);
  h = setMeta(h, "name", "twitter:title", homeEn["meta.title"]);
  h = setMeta(h, "name", "twitter:description", homeEn["meta.ogDescription"]);
  h = setMeta(h, "name", "twitter:image:alt", homeEn["meta.ogImageAlt"]);
  h = h.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${SITE + HOME_EN}" />`);
  h = h.replace(/<script type="application\/ld\+json">(.*?)<\/script>/s, (_, body) => {
    const ld = JSON.parse(body);
    for (const node of ld["@graph"]) {
      if (node["@type"] === "WebSite") { node.url = SITE + HOME_EN; node.name = "Fábio Fila — Résumé"; node.inLanguage = "en"; }
      if (node["@type"] === "Person") {
        node.url = SITE + HOME_EN;
        node.jobTitle = homeEn["meta.jobTitle"];
        node.description = homeEn["meta.ldDescription"];
        node.knowsLanguage = ["pt-BR", "en"];
      }
    }
    return jsonLd(ld);
  });
  // links e arquivos (a página fica um nível abaixo)
  h = h.replace(/(href|src)="assets\/Fabio_Fila_CV\.pdf"/g, '$1="../assets/Fabio_Fila_CV_EN.pdf"');
  h = h.replace(/(href|src)="assets\//g, '$1="../assets/');
  h = h.replace('title="Tema"', 'title="Theme"');
  h = h.replace(
    /<a class="btn-icon" id="langToggle".*?<\/a>/s,
    '<a class="btn-icon" id="langToggle" href="../" hreflang="pt-BR" lang="pt-BR" title="Versão em português"><span>PT</span><span class="sr-only"> — Mudar para português</span></a>'
  );
  emit("en/index.html", h);
  sitemapEntries.push({ pt: HOME_PT, en: HOME_EN });
}

/* ====================================================================
   2) Ferramentas Dev (índice + uma página por ferramenta, PT e EN)
   ==================================================================== */
const devEn = readJson("scripts/i18n/dev.en.json");
const tplPage = read("scripts/src/devtools.html");
const tplArticles = read("scripts/src/tools.html");
const articles = {};
for (const m of tplArticles.matchAll(/<article class="tool" id="tool-(\w+)"[\s\S]*?<\/article>/g)) articles[m[1]] = m[0];
for (const t of tools) if (!articles[t.id]) throw new Error(`Falta <article id="tool-${t.id}"> em scripts/src/tools.html`);

const STR = {
  pt: {
    indexTitle: "Ferramentas Dev — Gerador de CPF e CNPJ, UUID, JSON, JWT e mais | Fábio Fila",
    indexDesc: "Ferramentas gratuitas para desenvolvedores, direto no navegador: gerador e validador de CPF/CNPJ (inclusive alfanumérico), UUID, senhas, JSON, Base64, regex, JWT, hash e timestamp Unix.",
    cardsDesc: "Escolha uma ferramenta. Tudo roda no seu navegador — nada é enviado a servidor algum.",
    about: "Sobre esta ferramenta", resume: "Currículo", brand: "Fábio Fila", ogAlt: "Ferramentas Dev — Fábio Fila",
    groups: { docs: "Documentos", gen: "Geradores", data: "Texto e dados", debug: "Depuração" }
  },
  en: {
    indexTitle: "Dev Tools — CPF & CNPJ generator, UUID, JSON, JWT and more | Fábio Fila",
    indexDesc: "Free developer tools that run in your browser: CPF/CNPJ generator and validator (alphanumeric included), UUID, passwords, JSON, Base64, regex, JWT, hash and Unix timestamp.",
    cardsDesc: "Pick a tool. Everything runs in your browser — nothing is sent to any server.",
    about: "About this tool", resume: "Résumé", brand: "Fábio Fila", ogAlt: "Dev Tools — Fábio Fila",
    groups: { docs: "Documents", gen: "Generators", data: "Text & data", debug: "Debugging" }
  }
};
const LOCALE = { pt: "pt-BR", en: "en" };
const OG_LOCALE = { pt: "pt_BR", en: "en_US" };
const devBase = (lang) => (lang === "en" ? "/en/devtools/" : "/devtools/");
const devUrl = (lang, t) => devBase(lang) + (t ? t.slug + "/" : "");
const homeUrl = (lang) => (lang === "en" ? HOME_EN : HOME_PT);

function devHead({ lang, t, url, altUrl, title, desc }) {
  const s = STR[lang];
  const pt = lang === "pt" ? url : altUrl, en = lang === "en" ? url : altUrl;
  const rootRel = relUrl(url, "/");
  const alt = relUrl(url, altUrl);
  const crumbs = [
    { "@type": "ListItem", position: 1, name: s.resume, item: SITE + homeUrl(lang) },
    { "@type": "ListItem", position: 2, name: lang === "en" ? "Dev Tools" : "Ferramentas Dev", item: SITE + devUrl(lang) }
  ];
  let ld;
  if (t) {
    const d = t[lang];
    crumbs.push({ "@type": "ListItem", position: 3, name: d.name, item: SITE + url });
    ld = [
      {
        "@context": "https://schema.org", "@type": "WebApplication", name: d.name, url: SITE + url, description: d.desc,
        applicationCategory: "DeveloperApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript",
        inLanguage: LOCALE[lang], isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        author: { "@type": "Person", name: "Fábio Fila", url: SITE + "/" }
      },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs }
    ];
  } else {
    ld = [
      {
        "@context": "https://schema.org", "@type": "CollectionPage", name: lang === "en" ? "Dev Tools" : "Ferramentas Dev",
        url: SITE + url, description: s.indexDesc, inLanguage: LOCALE[lang],
        mainEntity: {
          "@type": "ItemList",
          itemListElement: tools.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x[lang].name, url: SITE + devUrl(lang, x) }))
        }
      },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs }
    ];
  }
  const redirect = lang === "pt"
    ? `\n  <script id="lang-redirect">try{if(localStorage.getItem("lang")==="en")location.replace(${JSON.stringify(alt)}+location.hash)}catch(e){}</script>`
    : "";
  return `<!DOCTYPE html>
<html lang="${LOCALE[lang]}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(title)}</title>
  <meta name="description" content="${escAttr(desc)}" />
  <meta name="author" content="Fábio Fila" />
  <meta name="robots" content="index,follow" />
  <meta name="theme-color" content="#6366f1" />
  <link rel="canonical" href="${SITE + url}" />
  ${hreflangs(pt, en)}

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Fábio Fila" />
  <meta property="og:title" content="${escAttr(title)}" />
  <meta property="og:description" content="${escAttr(desc)}" />
  <meta property="og:locale" content="${OG_LOCALE[lang]}" />
  <meta property="og:locale:alternate" content="${OG_LOCALE[lang === "pt" ? "en" : "pt"]}" />
  <meta property="og:url" content="${SITE + url}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escAttr(s.ogAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escAttr(title)}" />
  <meta name="twitter:description" content="${escAttr(desc)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${rootRel}assets/css/style.css" />
  <link rel="stylesheet" href="${rootRel}devtools/dev.css" />
  <link rel="icon" href="${rootRel}assets/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="${rootRel}assets/favicon-48.png" type="image/png" sizes="48x48" />
  <link rel="apple-touch-icon" href="${rootRel}assets/apple-touch-icon.png" />${redirect}
  <script>
    // aplica o tema antes da renderização para evitar flash
    try {
      var t = localStorage.getItem("theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", t);
    } catch (e) {}
  </script>
  ${ld.map(jsonLd).join("\n  ")}
</head>`;
}

function devPage(lang, t) {
  const s = STR[lang];
  const url = devUrl(lang, t);
  const altUrl = devUrl(lang === "pt" ? "en" : "pt", t);
  const rootRel = relUrl(url, "/");
  const label = `${lang}${url}`;
  const d = t ? t[lang] : null;
  const title = t ? `${d.title} | Fábio Fila` : s.indexTitle;
  const desc = t ? d.desc : s.indexDesc;

  let h = tplPage;
  h = h.replace("{{HEAD}}", devHead({ lang, t, url, altUrl, title, desc }));
  h = h.replace(/\{\{HOME\}\}/g, relUrl(url, homeUrl(lang)));
  h = h.replace("{{DEVJS}}", rootRel + "devtools/dev.js");
  h = h.replace(
    "{{LANG_TOGGLE}}",
    lang === "pt"
      ? `<a class="btn-icon" id="langToggle" href="${relUrl(url, altUrl)}" hreflang="en" lang="en" title="English version"><span>EN</span><span class="sr-only"> — Switch to English</span></a>`
      : `<a class="btn-icon" id="langToggle" href="${relUrl(url, altUrl)}" hreflang="pt-BR" lang="pt-BR" title="Versão em português"><span>PT</span><span class="sr-only"> — Mudar para português</span></a>`
  );

  // cabeçalho da página: <h1> do índice, ou migalhas de pão na página de ferramenta
  const devhead = t
    ? `<section class="devhead devhead--tool">
      <div class="container">
        <nav class="crumbs" aria-label="${lang === "en" ? "Breadcrumb" : "Trilha de navegação"}">
          <a href="${relUrl(url, homeUrl(lang))}">${s.resume}</a><span aria-hidden="true"> › </span><a href="${relUrl(url, devUrl(lang))}">${lang === "en" ? "Dev Tools" : "Ferramentas Dev"}</a><span aria-hidden="true"> › </span><span aria-current="page">${escHtml(d.name)}</span>
        </nav>
      </div>
    </section>`
    : `<section class="devhead">
      <div class="container">
        <p class="devhead__eyebrow" data-i18n="dev.eyebrow">// ferramentas</p>
        <h1 data-i18n="dev.title">Ferramentas Dev</h1>
        <p class="devhead__lead" data-i18n="dev.lead">Utilitários que uso no dia a dia. Tudo roda no seu navegador — nada é enviado para servidor algum.</p>
      </div>
    </section>`;
  h = h.replace("{{DEVHEAD}}", devhead);

  // menu lateral com links reais
  h = h.replace(/href="#(\w+)" data-tool="(\w+)"/g, (_, id) => {
    const x = tools.find((y) => y.id === id);
    const cur = t && t.id === id ? ' aria-current="page"' : "";
    return `href="${relUrl(url, devUrl(lang, x))}" data-tool="${id}"${cur}`;
  });

  // painel
  let panel;
  if (t) {
    const art = articles[t.id]
      .replace(" hidden>", ">")
      .replace(/<h2 (id="[^"]+-title"[^>]*)>([\s\S]*?)<\/h2>/, "<h1 $1>$2</h1>");
    panel = `${art}
        <section class="tool-about" aria-labelledby="about-title">
          <h2 id="about-title">${s.about}</h2>
          <p>${escHtml(d.about)}</p>
        </section>`;
  } else {
    panel = groups.map((g) => {
      const items = tools.filter((x) => x.group === g).map((x) => `
            <li><a class="card" href="${relUrl(url, devUrl(lang, x))}"><strong>${escHtml(x[lang].name)}</strong><span>${escHtml(x[lang].desc)}</span></a></li>`).join("");
      return `        <section class="cards" aria-labelledby="g-${g}">
          <h2 id="g-${g}">${s.groups[g]}</h2>
          <ul class="cards__list">${items}
          </ul>
        </section>`;
    }).join("\n");
  }
  h = h.replace("{{PANEL}}", panel);

  if (lang === "en") {
    h = applyI18n(h, devEn, label);
    h = applyAria(h, devEn, label);
    h = h.replace('title="Tema"', 'title="Theme"');
  }
  h = stripI18nAttrs(h);
  // tags <html> do template já vieram de devHead; nada mais a ajustar
  emit(urlToFile(url), h);
  return { url, altUrl };
}

function buildDevtools() {
  for (const lang of ["pt", "en"]) {
    devPage(lang, null);
    for (const t of tools) devPage(lang, t);
  }
  sitemapEntries.push({ pt: devUrl("pt"), en: devUrl("en") });
  for (const t of tools) sitemapEntries.push({ pt: devUrl("pt", t), en: devUrl("en", t) });
}

/* ====================================================================
   3) sitemap.xml
   ==================================================================== */
function buildSitemap() {
  const alt = (e) =>
    `    <xhtml:link rel="alternate" hreflang="pt-BR" href="${SITE + e.pt}"/>\n` +
    `    <xhtml:link rel="alternate" hreflang="en" href="${SITE + e.en}"/>\n` +
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE + e.pt}"/>`;
  const urls = sitemapEntries.flatMap((e) => [e.pt, e.en].map((u) => {
    const prio = u === "/" || u === "/en/" ? "1.0" : u.endsWith("/devtools/") ? "0.8" : "0.6";
    return `  <url>\n    <loc>${SITE + u}</loc>\n${alt(e)}\n    <priority>${prio}</priority>\n  </url>`;
  }));
  emit("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
}

buildHomeEn();
buildDevtools();
buildSitemap();

warnings.forEach((w) => console.warn("aviso:", w));
if (CHECK) {
  if (stale.length) {
    console.error("Arquivos desatualizados (rode: node scripts/build.mjs):\n  " + stale.join("\n  "));
    process.exit(1);
  }
  console.log("Tudo em dia.");
} else {
  console.log("Gerado: en/index.html, devtools/ e en/devtools/ (índice + " + tools.length + " ferramentas), sitemap.xml");
}
