# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static, single-page résumé site for Fábio Fila (served at https://curriculo.fabiofila.com.br). Plain HTML/CSS/JS — no dependencies, no package manager, no build, no tests, no linter. To preview, open `index.html` in a browser (or serve the folder with any static server, e.g. `python3 -m http.server`).

Files that matter:
- `index.html` — the whole page; sections are `<section id="...">` (`hero`, `sobre`, `skills`, `experiencia`, `projetos`, `ia`, `clientes`, `formacao`, `contato`), linked from the nav.
- `assets/js/main.js` — one IIFE with all interactions.
- `assets/css/style.css` — all styles; design tokens on `:root`, dark-mode overrides under `[data-theme="dark"]`.
- `assets/logos/` — client logos.
- `devtools/` — página `/devtools/` ("Ferramentas Dev", linkada no menu): menu lateral (agrupado, navegação por `#hash`) + um `<article class="tool" id="tool-<id>">` por utilitário: geradores de CPF/CNPJ (numérico e alfanumérico), validador, UUID v4/v7, senhas, JSON, Base64/URL, regex, JWT, hash MD5/SHA e timestamp Unix. Tem `index.html`, `dev.css` e `dev.js` próprios (reaproveita `assets/css/style.css`; tema e idioma compartilhados via `localStorage`; textos EN no dicionário `EN` de `dev.js`). Para nova ferramenta: item no `.menu` + novo `<article class="tool" hidden>` + lógica em `dev.js` (strings dinâmicas via `L(pt, en)`).
- `pdf/cv.html` / `pdf/cv-en.html` — print-only sources of the downloadable CVs `assets/Fabio_Fila_CV.pdf` / `assets/Fabio_Fila_CV_EN.pdf`. Same CSS duplicated in both; keep them in sync. They use a locally installed font (Noto Sans) on purpose: a Google Fonts variable font gets embedded as Type 3 glyphs. Regenerate after editing (repeat with `cv-en.html` → `Fabio_Fila_CV_EN.pdf`):
  `google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=assets/Fabio_Fila_CV.pdf "file://$PWD/pdf/cv.html"`
- `pdf/og-image.html` — source of `assets/og-image.png` (1200×630 share image): `google-chrome --headless=new --hide-scrollbars --window-size=1200,630 --screenshot=assets/og-image.png "file://$PWD/pdf/og-image.html"`
- Download links carry a `data-cv` attribute; `applyLang` in `main.js` points them at the PT or EN PDF.

## Deploy

Pushing to `main` auto-deploys via Cloudflare Workers Builds (Worker `curriculo`, deploy command `npx wrangler deploy`). `wrangler.jsonc` serves the repo root as static assets; `.assetsignore` keeps repo-only files (`.git`, docs, `pdf/` sources, wrangler config) from being published — add new non-public files there. The Worker `name` must stay `curriculo` to match the dashboard project. Check locally with `npx wrangler dev` (or `npx wrangler deploy --dry-run`).

## Bilingual content (PT/EN) — the key thing to know

Portuguese is the source language and lives **directly in `index.html`**. English lives **only in the `I18N.en` dictionary in `assets/js/main.js`**. Elements are linked by a `data-i18n="section.key"` attribute:

- On load, `main.js` snapshots each `[data-i18n]` element's PT `innerHTML`; toggling to EN swaps in `I18N.en[key]`, toggling back restores the snapshot. Values are HTML (may contain `<strong>` etc.).
- When adding or changing translatable text: edit the PT text in `index.html`, add/update the matching key in `I18N.en`. A missing EN key silently falls back to PT.
- The hero role rotator is not driven by `data-i18n`; its texts are the `rolesPT` / `rolesEN` arrays in `main.js`.
- `aria-label`s are translated the same way via `data-i18n-aria="key"` (keys under `a11y.*`).
- Language and theme choices persist in `localStorage` (`lang`, `theme`).

## Content kept in sync across files

The same résumé content (experience, projects, skills, clients, contact) appears in several places: `index.html` (PT) + `I18N.en` in `main.js` (EN), `README.md`, and `pdf/cv.html` + `pdf/cv-en.html` (→ the PDFs). When the résumé content changes, update all of them and regenerate both PDFs.

## Accessibility

The CV claims accessibility, so the site must keep a Lighthouse accessibility score of 100 in light, dark and EN modes. Watch text contrast (≥ 4.5:1) when touching color tokens: `--on-primary` is the text color on `--primary` backgrounds, and differs per theme. Decorative emojis are wrapped in `aria-hidden="true"`, including those inside `I18N.en` strings. Audit with `npx lighthouse <url> --only-categories=accessibility`.

## Conventions

- Positioning is **Back-End** developer (with full stack background) — keep titles/summaries consistent with that.

- Code comments, commit messages and README are in Portuguese.
