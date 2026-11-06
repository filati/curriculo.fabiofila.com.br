# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static, single-page résumé site for Fábio Fila (served at https://curriculo.fabiofila.com.br). Plain HTML/CSS/JS — no dependencies, no package manager, no tests, no linter. Some pages are **generated** by a dependency-free Node script (`scripts/build.mjs`, see "Generated pages") and committed; nothing runs at deploy time. To preview, serve the folder with any static server, e.g. `python3 -m http.server` (paths are relative, so `file://` also works for most pages).

Files that matter:
- `index.html` — the whole page; sections are `<section id="...">` (`hero`, `sobre`, `skills`, `experiencia`, `projetos`, `ia`, `clientes`, `formacao`, `contato`), linked from the nav.
- `assets/js/main.js` — one IIFE with all interactions.
- `assets/css/style.css` — all styles; design tokens on `:root`, dark-mode overrides under `[data-theme="dark"]`.
- `assets/logos/` — client logos.
- `devtools/` + `en/devtools/` — "Ferramentas Dev" (linked in the nav): an index plus **one page per tool** (`/devtools/gerador-cpf/`, …, and `/en/devtools/...`), all GENERATED. Tools: CPF/CNPJ generators (numeric and alphanumeric), validator, UUID v4/v7, passwords, JSON, Base64/URL, regex, JWT, MD5/SHA hash, Unix timestamp. `dev.js` and `dev.css` are hand-written and shared by every page (each page only contains its own tool, so `dev.js` tolerates missing elements; dynamic strings use `L(pt, en)`, with the language taken from `<html lang>`). Old `/devtools/#cpf` links are redirected by `dev.js`. To add a tool: add its `<article class="tool" id="tool-<id>">` to `scripts/src/tools.html`, a menu item (`data-tool="<id>"`) to `scripts/src/devtools.html`, an entry (slug, group, PT/EN title/description/about) to `scripts/tools.mjs`, EN strings to `scripts/i18n/dev.en.json`, logic to `dev.js`, then run the build.
- `scripts/` — generator and its sources (not published; listed in `.assetsignore`): `build.mjs`, `tools.mjs` (SEO metadata per tool), `i18n/home.en.json` and `i18n/dev.en.json` (English dictionaries), `src/devtools.html` (page template) and `src/tools.html` (all tool articles).
- `robots.txt`, `sitemap.xml` (generated, hreflang PT/EN), `favicon.ico` + `assets/favicon*.{svg,png}` + `assets/apple-touch-icon.png`.
- `pdf/cv.html` / `pdf/cv-en.html` — print-only sources of the downloadable CVs `assets/Fabio_Fila_CV.pdf` / `assets/Fabio_Fila_CV_EN.pdf`. Same CSS duplicated in both; keep them in sync. They use a locally installed font (Noto Sans) on purpose: a Google Fonts variable font gets embedded as Type 3 glyphs. Regenerate after editing (repeat with `cv-en.html` → `Fabio_Fila_CV_EN.pdf`):
  `google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=assets/Fabio_Fila_CV.pdf "file://$PWD/pdf/cv.html"`
- `pdf/og-image.html` — source of `assets/og-image.png` (1200×630 share image): `google-chrome --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=assets/og-image.png "file://$PWD/pdf/og-image.html"`
- Download links carry a `data-cv` attribute; the build points them at the EN PDF on `/en/`.

## Deploy

Pushing to `main` auto-deploys via Cloudflare Workers Builds (Worker `curriculo`, deploy command `npx wrangler deploy`). `wrangler.jsonc` serves the repo root as static assets; `.assetsignore` keeps repo-only files (`.git`, docs, `pdf/` sources, wrangler config) from being published — add new non-public files there. The Worker `name` must stay `curriculo` to match the dashboard project. Check locally with `npx wrangler dev` (or `npx wrangler deploy --dry-run`).

## Generated pages

Run `node scripts/build.mjs` (or `--check` to verify) after touching `index.html`, `scripts/i18n/*.json`, `scripts/src/*` or `scripts/tools.mjs`, and commit the output. **Never edit generated files** (`en/**`, `devtools/**/index.html`, `en/devtools/**`, `sitemap.xml`) — they are overwritten.

## Bilingual content (PT/EN) — the key thing to know

PT and EN are **separate URLs** (for SEO): `/` (PT) and `/en/` (EN), `/devtools/...` and `/en/devtools/...`, linked by `hreflang` and in the sitemap. The language toggle is a plain link to the other page; the choice is remembered in `localStorage` (`lang`) and a tiny inline script (`#lang-redirect`) sends returning EN users from PT pages to the EN equivalent.

Portuguese is the source language and lives **directly in `index.html`**. English lives **only in `scripts/i18n/home.en.json`** (home) and `scripts/i18n/dev.en.json` (dev tools). Elements are linked by a `data-i18n="section.key"` attribute; the build swaps each element's inner HTML for the EN value (values are HTML, may contain `<strong>` etc.). A missing EN key falls back to PT and the build prints a warning.

- When adding or changing translatable text: edit the PT text in `index.html`, add/update the key in `home.en.json`, run the build.
- `aria-label`s: `data-i18n-aria="key"` (keys under `a11y.*`). Head metadata (title, description, OG/Twitter, JSON-LD) are keyed `meta.*` in `home.en.json`; the build rewrites canonical, `og:url`, locale and relative asset paths for `/en/`.
- The hero role rotator is not driven by `data-i18n`; its texts are `rolesPT` / `rolesEN` in `main.js` (language read from `<html lang>`).
- The theme choice persists in `localStorage` (`theme`).

## SEO

Keep: unique `<title>`/description per page, canonical + hreflang on every page, one `<h1>`, JSON-LD (`Person`/`WebSite` on the home, `WebApplication`/`BreadcrumbList` per tool), OG/Twitter tags, `robots.txt`, `sitemap.xml`. Lighthouse SEO and accessibility are 100 on all page types — re-check after structural changes (`npx lighthouse <url> --only-categories=accessibility,seo`).

## Content kept in sync across files

The same résumé content (experience, projects, skills, clients, contact) appears in several places: `index.html` (PT) + `scripts/i18n/home.en.json` (EN, then rebuild), `README.md`, and `pdf/cv.html` + `pdf/cv-en.html` (→ the PDFs). When the résumé content changes, update all of them and regenerate both PDFs.

## Accessibility

The CV claims accessibility, so the site must keep a Lighthouse accessibility score of 100 in light, dark and EN modes. Watch text contrast (≥ 4.5:1) when touching color tokens: `--on-primary` is the text color on `--primary` backgrounds, and differs per theme. Decorative emojis are wrapped in `aria-hidden="true"`, including those inside the EN dictionaries. Audit with `npx lighthouse <url> --only-categories=accessibility`.

## Conventions

- Positioning is **Back-End** developer (with full stack background) — keep titles/summaries consistent with that.

- Code comments, commit messages and README are in Portuguese.
