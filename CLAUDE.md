# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static, single-page résumé site for Fábio Fila (served at https://curriculo.fabiofila.com.br). Plain HTML/CSS/JS — no dependencies, no package manager, no build, no tests, no linter. To preview, open `index.html` in a browser (or serve the folder with any static server, e.g. `python3 -m http.server`).

Files that matter:
- `index.html` — the whole page; sections are `<section id="...">` (`hero`, `sobre`, `skills`, `experiencia`, `projetos`, `ia`, `clientes`, `formacao`, `contato`), linked from the nav.
- `assets/js/main.js` — one IIFE with all interactions.
- `assets/css/style.css` — all styles; design tokens on `:root`, dark-mode overrides under `[data-theme="dark"]`.
- `assets/logos/` — client logos.
- `pdf/cv.html` — print-only source of the downloadable CV `assets/Fabio_Fila_CV.pdf` (PT only). Uses a locally installed font (Noto Sans) on purpose: a Google Fonts variable font gets embedded as Type 3 glyphs. Regenerate after editing:
  `google-chrome --headless=new --no-pdf-header-footer --print-to-pdf=assets/Fabio_Fila_CV.pdf "file://$PWD/pdf/cv.html"`

## Bilingual content (PT/EN) — the key thing to know

Portuguese is the source language and lives **directly in `index.html`**. English lives **only in the `I18N.en` dictionary in `assets/js/main.js`**. Elements are linked by a `data-i18n="section.key"` attribute:

- On load, `main.js` snapshots each `[data-i18n]` element's PT `innerHTML`; toggling to EN swaps in `I18N.en[key]`, toggling back restores the snapshot. Values are HTML (may contain `<strong>` etc.).
- When adding or changing translatable text: edit the PT text in `index.html`, add/update the matching key in `I18N.en`. A missing EN key silently falls back to PT.
- The hero role rotator is not driven by `data-i18n`; its texts are the `rolesPT` / `rolesEN` arrays in `main.js`.
- Language and theme choices persist in `localStorage` (`lang`, `theme`).

## Content kept in sync across files

The same résumé content (experience, projects, skills, clients, contact) appears in three places: `index.html` (PT) + `I18N.en` in `main.js` (EN), `README.md`, and `pdf/cv.html` (→ the PDF). When the résumé content changes, update all of them and regenerate the PDF.

## Conventions

- Code comments, commit messages and README are in Portuguese.
