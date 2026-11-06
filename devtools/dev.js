/* Ferramentas Dev — geradores de CPF e CNPJ */
(function () {
  "use strict";

  /* ---------- Tema e idioma (compartilhados com o currículo via localStorage) ---------- */
  var root = document.documentElement;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  document.getElementById("themeToggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("theme", next);
  });

  var EN = {
    "a11y.skip": "Skip to content", "a11y.theme": "Toggle light/dark theme",
    "nav.back": "← Résumé",
    "dev.eyebrow": "// tools", "dev.title": "Dev Tools",
    "dev.lead": "Utilities I use day to day. Everything runs in your browser — nothing is sent to any server.",
    "dev.disclaimer": "Generated numbers are fictitious and meant only for testing and development. Do not use them for fraudulent purposes.",
    "common.qty": "Quantity", "common.mask": "Formatted", "common.gen": "Generate", "common.copyall": "Copy all",
    "cpf.title": "CPF generator", "cpf.desc": "Random CPFs with valid check digits. For testing only.",
    "cpf.uf": "Issuing state", "cpf.any": "Any",
    "cnpj.title": "CNPJ generator",
    "cnpj.desc": "Random CNPJs with valid check digits, in the numeric or the new alphanumeric format. For testing only.",
    "cnpj.alpha": "Alphanumeric"
  };
  var UI = { pt: { copy: "Copiar", copied: "Copiado!", copyLabel: "Copiar " }, en: { copy: "Copy", copied: "Copied!", copyLabel: "Copy " } };

  var pt = new Map(), ptAria = new Map();
  document.querySelectorAll("[data-i18n]").forEach(function (el) { pt.set(el, el.innerHTML); });
  document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { ptAria.set(el, el.getAttribute("aria-label")); });
  var lang = store("lang") === "en" ? "en" : "pt";

  function applyLang(l) {
    lang = l;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      el.innerHTML = l === "en" && EN[k] != null ? EN[k] : pt.get(el);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-aria");
      el.setAttribute("aria-label", l === "en" && EN[k] != null ? EN[k] : ptAria.get(el));
    });
    root.lang = l === "en" ? "en" : "pt-BR";
    var lbl = document.getElementById("langLabel"), hint = document.getElementById("langHint");
    lbl.textContent = l === "en" ? "PT" : "EN";
    hint.textContent = l === "en" ? " — Mudar para português" : " — Switch to English";
    lbl.lang = hint.lang = l === "en" ? "pt-BR" : "en";
    document.title = l === "en" ? "Dev Tools — Fábio Fila" : "Ferramentas Dev — Fábio Fila";
    document.querySelectorAll(".results button").forEach(function (b) { b.textContent = UI[l].copy; b.setAttribute("aria-label", UI[l].copyLabel + b.dataset.value); });
    store("lang", l);
  }
  document.getElementById("langToggle").addEventListener("click", function () { applyLang(lang === "en" ? "pt" : "en"); });

  /* ---------- Utilidades ---------- */
  function randInt(max) { // inteiro uniforme em [0, max)
    var a = new Uint32Array(1), limit = 4294967296 - (4294967296 % max);
    do { crypto.getRandomValues(a); } while (a[0] >= limit);
    return a[0] % max;
  }
  function allEqual(s) { return s.split("").every(function (c) { return c === s[0]; }); }
  function clampQty(input) {
    var n = parseInt(input.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 100) n = 100;
    input.value = n;
    return n;
  }

  /* ---------- CPF ---------- */
  function cpfDigit(digits) { // digits: array de números
    var w = digits.length + 1, sum = 0;
    for (var i = 0; i < digits.length; i++) sum += digits[i] * (w - i);
    var r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  }
  function genCPF(region) {
    for (;;) {
      var d = [];
      for (var i = 0; i < 8; i++) d.push(randInt(10));
      d.push(region === "" ? randInt(10) : parseInt(region, 10)); // 9º dígito = região fiscal
      if (allEqual(d.join(""))) continue;
      d.push(cpfDigit(d));
      d.push(cpfDigit(d));
      return d.join("");
    }
  }
  function maskCPF(s) { return s.slice(0, 3) + "." + s.slice(3, 6) + "." + s.slice(6, 9) + "-" + s.slice(9); }

  /* ---------- CNPJ (numérico e alfanumérico — IN RFB 2229/2024) ---------- */
  var ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function cnpjDigit(chars) { // chars: string; valor = código ASCII − 48
    var len = chars.length, weights = [], w = 2, sum = 0, i;
    for (i = 0; i < len; i++) { weights.unshift(w); w = w === 9 ? 2 : w + 1; }
    for (i = 0; i < len; i++) sum += (chars.charCodeAt(i) - 48) * weights[i];
    var r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  }
  function genCNPJ(alpha) {
    for (;;) {
      var base = "", i;
      for (i = 0; i < 8; i++) base += alpha ? ALNUM[randInt(ALNUM.length)] : String(randInt(10));
      if (allEqual(base)) continue;
      base += "0001"; // filial: matriz
      base += cnpjDigit(base);
      base += cnpjDigit(base);
      return base;
    }
  }
  function maskCNPJ(s) { return s.slice(0, 2) + "." + s.slice(2, 5) + "." + s.slice(5, 8) + "/" + s.slice(8, 12) + "-" + s.slice(12); }

  /* ---------- UI ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  function flash(btn, label) {
    var old = btn.textContent;
    btn.textContent = label;
    setTimeout(function () { btn.textContent = old; }, 1200);
  }

  function setupTool(p, generate, mask) {
    var out = document.getElementById(p + "-out");
    function run() {
      var n = clampQty(document.getElementById(p + "-qty"));
      var useMask = document.getElementById(p + "-mask").checked;
      out.textContent = "";
      for (var i = 0; i < n; i++) {
        var raw = generate();
        var shown = useMask ? mask(raw) : raw;
        var li = document.createElement("li");
        var code = document.createElement("code"); code.textContent = shown;
        var btn = document.createElement("button");
        btn.type = "button"; btn.dataset.value = shown;
        btn.textContent = UI[lang].copy; btn.setAttribute("aria-label", UI[lang].copyLabel + shown);
        li.appendChild(code); li.appendChild(btn); out.appendChild(li);
      }
    }
    document.getElementById(p + "-gen").addEventListener("click", run);
    document.getElementById(p + "-mask").addEventListener("change", run);
    out.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) copyText(b.dataset.value).then(function () { flash(b, UI[lang].copied); }, function () {});
    });
    document.getElementById(p + "-copyall").addEventListener("click", function () {
      var vals = Array.prototype.map.call(out.querySelectorAll("button"), function (b) { return b.dataset.value; });
      if (vals.length) copyText(vals.join("\n")).then(function () { flash(document.getElementById(p + "-copyall"), UI[lang].copied); }, function () {});
    });
    return run;
  }

  var runCPF = setupTool("cpf", function () { return genCPF(document.getElementById("cpf-uf").value); }, maskCPF);
  var runCNPJ = setupTool("cnpj", function () { return genCNPJ(document.getElementById("cnpj-alpha").checked); }, maskCNPJ);
  document.getElementById("cpf-uf").addEventListener("change", runCPF);
  document.getElementById("cnpj-alpha").addEventListener("change", runCNPJ);

  if (lang === "en") applyLang("en");
  runCPF();
  runCNPJ();
})();
