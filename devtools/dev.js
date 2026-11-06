/* Ferramentas Dev — menu, geradores e utilitários (tudo local, sem servidor) */
(function () {
  "use strict";

  var root = document.documentElement;
  // Cada página de /devtools/ traz só UMA ferramenta (gerada por scripts/build.mjs). Para os ids das demais,
  // devolvemos um nó solto (dentro de um ".tool" falso), de modo que os listeners abaixo não precisem de checagem.
  function $(id) {
    var el = document.getElementById(id);
    if (el) return el;
    var wrap = document.createElement("div");
    wrap.className = "tool";
    return wrap.appendChild(document.createElement("div"));
  }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  /* ---------- Tema ---------- */
  $("themeToggle").addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("theme", next);
  });

  /* ---------- Idioma: PT (/devtools/) e EN (/en/devtools/) são páginas separadas ---------- */
  var lang = root.lang === "en" ? "en" : "pt";
  function L(pt, en) { return lang === "en" ? en : pt; }
  store("lang", lang);
  $("langToggle").addEventListener("click", function () { store("lang", lang === "en" ? "pt" : "en"); });

  /* ---------- Links antigos (/devtools/#cpf) levam à página da ferramenta ---------- */
  if (!document.querySelector(".tool") && location.hash.length > 1) {
    var old = document.querySelector('.menu a[data-tool="' + location.hash.slice(1).replace(/[^\w-]/g, "") + '"]');
    if (old) location.replace(old.getAttribute("href"));
  }

  /* ---------- Utilidades ---------- */
  function randInt(max) {
    var a = new Uint32Array(1), limit = 4294967296 - (4294967296 % max);
    do { crypto.getRandomValues(a); } while (a[0] >= limit);
    return a[0] % max;
  }
  function allEqual(s) { return s.split("").every(function (c) { return c === s[0]; }); }
  function clampInt(input, min, max, def) {
    var n = parseInt(input.value, 10);
    if (isNaN(n)) n = def;
    n = Math.max(min, Math.min(max, n));
    input.value = n;
    return n;
  }
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
  function flash(btn) {
    var old = btn.textContent;
    btn.textContent = L("Copiado!", "Copied!");
    setTimeout(function () { btn.textContent = old; }, 1200);
  }
  function setStatus(el, ok, msg) {
    el.className = "status" + (ok === null ? "" : ok ? " ok" : " bad");
    el.textContent = msg || "";
  }
  function bytesOf(str) { return new TextEncoder().encode(str); }
  function b64FromBytes(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function bytesFromB64(b64) { // aceita Base64 e Base64URL
    var s = b64.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function utf8(bytes) { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }

  // Botões genéricos "Copiar" (data-copy aponta para o id de um campo) e de itens de lista (data-value)
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.copy) {
      var el = $(b.dataset.copy), txt = el.value != null ? el.value : el.textContent;
      if (txt) copyText(txt).then(function () { flash(b); }, function () {});
    } else if (b.dataset.value != null && b.closest(".results")) {
      copyText(b.dataset.value).then(function () { flash(b); }, function () {});
    }
  });

  function addRow(ul, text, label) {
    var li = document.createElement("li");
    var wrap = document.createElement("div");
    if (label) { var s = document.createElement("span"); s.className = "lbl"; s.textContent = label; wrap.appendChild(s); }
    var code = document.createElement("code"); code.textContent = text; wrap.appendChild(code);
    var btn = document.createElement("button");
    btn.type = "button"; btn.dataset.value = text;
    btn.textContent = L("Copiar", "Copy"); btn.setAttribute("aria-label", L("Copiar ", "Copy ") + text);
    li.appendChild(wrap); li.appendChild(btn); ul.appendChild(li);
  }

  /* Lista de itens gerados (CPF, CNPJ, UUID, senhas) */
  function setupList(p, makeOne, after) {
    var out = $(p + "-out");
    function run() {
      var n = clampInt($(p + "-qty"), 1, 100, 1);
      out.textContent = "";
      for (var i = 0; i < n; i++) addRow(out, makeOne());
      if (after) after();
    }
    $(p + "-gen").addEventListener("click", run);
    out.closest(".tool").querySelectorAll(".tool__opts input, .tool__opts select").forEach(function (c) {
      c.addEventListener("change", run);
    });
    $(p + "-copyall").addEventListener("click", function () {
      var vals = Array.prototype.map.call(out.querySelectorAll("button"), function (b) { return b.dataset.value; });
      if (vals.length) copyText(vals.join("\n")).then(function () { flash($(p + "-copyall")); }, function () {});
    });
    run();
  }

  /* ---------- CPF ---------- */
  function cpfDigit(d) {
    var w = d.length + 1, sum = 0;
    for (var i = 0; i < d.length; i++) sum += d[i] * (w - i);
    var r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  }
  function genCPF(region) {
    for (;;) {
      var d = [], i;
      for (i = 0; i < 8; i++) d.push(randInt(10));
      d.push(region === "" ? randInt(10) : parseInt(region, 10));
      if (allEqual(d.join(""))) continue;
      d.push(cpfDigit(d)); d.push(cpfDigit(d));
      return d.join("");
    }
  }
  function maskCPF(s) { return s.slice(0, 3) + "." + s.slice(3, 6) + "." + s.slice(6, 9) + "-" + s.slice(9); }
  function validCPF(s) {
    if (!/^\d{11}$/.test(s) || allEqual(s)) return false;
    var d = s.split("").map(Number);
    return cpfDigit(d.slice(0, 9)) === d[9] && cpfDigit(d.slice(0, 10)) === d[10];
  }

  /* ---------- CNPJ (numérico e alfanumérico) ---------- */
  var ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function cnpjDigit(chars) {
    var len = chars.length, w = 2, sum = 0, i;
    for (i = len - 1; i >= 0; i--) { sum += (chars.charCodeAt(i) - 48) * w; w = w === 9 ? 2 : w + 1; }
    var r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  }
  function genCNPJ(alpha) {
    for (;;) {
      var base = "", i;
      for (i = 0; i < 8; i++) base += alpha ? ALNUM[randInt(ALNUM.length)] : String(randInt(10));
      if (allEqual(base)) continue;
      base += "0001";
      base += cnpjDigit(base);
      base += cnpjDigit(base);
      return base;
    }
  }
  function maskCNPJ(s) { return s.slice(0, 2) + "." + s.slice(2, 5) + "." + s.slice(5, 8) + "/" + s.slice(8, 12) + "-" + s.slice(12); }
  function validCNPJ(s) {
    if (!/^[0-9A-Z]{12}\d{2}$/.test(s) || allEqual(s)) return false;
    return cnpjDigit(s.slice(0, 12)) === +s[12] && cnpjDigit(s.slice(0, 13)) === +s[13];
  }

  setupList("cpf", function () {
    var raw = genCPF($("cpf-uf").value);
    return $("cpf-mask").checked ? maskCPF(raw) : raw;
  });
  setupList("cnpj", function () {
    var raw = genCNPJ($("cnpj-alpha").checked);
    return $("cnpj-mask").checked ? maskCNPJ(raw) : raw;
  });

  /* ---------- Validador ---------- */
  function runValidate() {
    var el = $("val-out"), raw = $("val-in").value.trim();
    if (!raw) return setStatus(el, null, "");
    var s = raw.toUpperCase().replace(/[.\-\/\s]/g, "");
    var kind = /^\d{11}$/.test(s) ? "CPF" : /^[0-9A-Z]{12}\d{2}$/.test(s) ? "CNPJ" : null;
    if (!kind) return setStatus(el, false, "✗ " + L("Formato inválido: informe 11 dígitos (CPF) ou 14 caracteres (CNPJ).", "Invalid format: enter 11 digits (CPF) or 14 characters (CNPJ)."));
    var ok = kind === "CPF" ? validCPF(s) : validCNPJ(s);
    setStatus(el, ok, ok ? "✓ " + kind + L(" válido.", " is valid.") : "✗ " + kind + L(" inválido (dígitos verificadores não conferem).", " is invalid (check digits do not match)."));
  }
  $("val-in").addEventListener("input", runValidate);

  /* ---------- UUID ---------- */
  function hex(b) { return Array.prototype.map.call(b, function (x) { return (x < 16 ? "0" : "") + x.toString(16); }).join(""); }
  function uuid(version) {
    var b = new Uint8Array(16);
    crypto.getRandomValues(b);
    if (version === 7) {
      var t = Date.now();
      b[0] = Math.floor(t / 1099511627776) & 255; b[1] = Math.floor(t / 4294967296) & 255;
      b[2] = (t >>> 24) & 255; b[3] = (t >>> 16) & 255; b[4] = (t >>> 8) & 255; b[5] = t & 255;
    }
    b[6] = (b[6] & 15) | (version << 4);
    b[8] = (b[8] & 63) | 128;
    var h = hex(b);
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }
  setupList("uuid", function () {
    var u = uuid(parseInt($("uuid-ver").value, 10));
    if (!$("uuid-dash").checked) u = u.replace(/-/g, "");
    return $("uuid-upper").checked ? u.toUpperCase() : u;
  });

  /* ---------- Senhas ---------- */
  var lastBits = 0;
  function password() {
    var len = clampInt($("pw-len"), 4, 128, 20), amb = $("pw-amb").checked;
    var sets = [];
    [["pw-lower", "abcdefghijklmnopqrstuvwxyz"], ["pw-upper", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
     ["pw-digit", "0123456789"], ["pw-sym", "!@#$%^&*()-_=+[]{};:,.?/"]].forEach(function (c) {
      if ($(c[0]).checked) sets.push(amb ? c[1].replace(/[O0lI1|]/g, "") : c[1]);
    });
    if (!sets.length) sets.push("abcdefghijklmnopqrstuvwxyz");
    var all = sets.join(""), out = [], i;
    sets.forEach(function (s) { out.push(s[randInt(s.length)]); });
    while (out.length < len) out.push(all[randInt(all.length)]);
    out = out.slice(0, len);
    for (i = out.length - 1; i > 0; i--) { var j = randInt(i + 1), t = out[i]; out[i] = out[j]; out[j] = t; }
    lastBits = Math.round(len * Math.log2(all.length));
    return out.join("");
  }
  function pwInfo() {
    $("pw-info").textContent = L("Entropia aproximada: ", "Approximate entropy: ") + lastBits + " bits";
  }
  setupList("pw", password, pwInfo);

  /* ---------- JSON ---------- */
  function sortKeys(v) {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (v && typeof v === "object" && !(JSON.isRawJSON && JSON.isRawJSON(v))) {
      var o = {};
      Object.keys(v).sort().forEach(function (k) { o[k] = sortKeys(v[k]); });
      return o;
    }
    return v;
  }
  // Preserva números que o double não representa (usa JSON.rawJSON, quando o navegador suporta)
  function parseJSON(src) {
    if (!JSON.rawJSON) return JSON.parse(src);
    return JSON.parse(src, function (k, v, ctx) {
      return typeof v === "number" && ctx && ctx.source !== undefined && String(v) !== ctx.source && /^-?\d+$/.test(ctx.source)
        ? JSON.rawJSON(ctx.source) : v;
    });
  }
  function jsonRun(minify) {
    var st = $("json-status"), out = $("json-out"), src = $("json-in").value;
    if (!src.trim()) { out.value = ""; return setStatus(st, null, ""); }
    try {
      var v = parseJSON(src);
      if ($("json-sort").checked) v = sortKeys(v);
      var ind = $("json-indent").value;
      out.value = JSON.stringify(v, null, minify ? 0 : ind === "tab" ? "\t" : parseInt(ind, 10));
      setStatus(st, true, "✓ " + L("JSON válido.", "Valid JSON."));
    } catch (e) {
      out.value = "";
      var msg = e.message, m = /position (\d+)/.exec(msg);
      if (m && !/line \d+/.test(msg)) {
        var before = src.slice(0, +m[1]).split("\n");
        msg += " (" + L("linha ", "line ") + before.length + L(", coluna ", ", column ") + (before[before.length - 1].length + 1) + ")";
      }
      setStatus(st, false, "✗ " + msg);
    }
  }
  $("json-fmt").addEventListener("click", function () { jsonRun(false); });
  $("json-min").addEventListener("click", function () { jsonRun(true); });

  /* ---------- Base64 / URL ---------- */
  function b64Run(encode) {
    var st = $("b64-status"), src = $("b64-in").value, mode = $("b64-mode").value, res;
    try {
      if (mode === "url") res = encode ? encodeURIComponent(src) : decodeURIComponent(src.replace(/\+/g, " "));
      else if (encode) {
        res = b64FromBytes(bytesOf(src));
        if (mode === "b64url") res = res.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      } else res = utf8(bytesFromB64(src));
      $("b64-out").value = res;
      setStatus(st, true, "✓ " + (encode ? L("Codificado.", "Encoded.") : L("Decodificado.", "Decoded.")));
    } catch (e) {
      $("b64-out").value = "";
      setStatus(st, false, "✗ " + L("Entrada inválida para decodificar.", "Invalid input to decode."));
    }
  }
  $("b64-enc").addEventListener("click", function () { b64Run(true); });
  $("b64-dec").addEventListener("click", function () { b64Run(false); });

  /* ---------- Regex ---------- */
  function regexRun() {
    var st = $("re-status"), hl = $("re-hl"), list = $("re-list");
    var pat = $("re-pattern").value, flags = $("re-flags").value, text = $("re-text").value;
    hl.textContent = ""; list.textContent = "";
    if (!pat) return setStatus(st, null, "");
    var re;
    try { re = new RegExp(pat, flags.indexOf("g") < 0 ? flags + "g" : flags); }
    catch (e) { return setStatus(st, false, "✗ " + e.message); }
    var ms = [], it = text.matchAll(re), r;
    while (!(r = it.next()).done && ms.length < 500) ms.push(r.value);
    setStatus(st, ms.length > 0 ? true : null, ms.length + L(" correspondência(s)" + (ms.length === 500 ? " (limite de 500)" : ""), " match(es)" + (ms.length === 500 ? " (limit 500)" : "")));
    var pos = 0;
    ms.forEach(function (m, n) {
      if (m[0].length) {
        hl.appendChild(document.createTextNode(text.slice(pos, m.index)));
        var mk = document.createElement("mark"); mk.textContent = m[0]; hl.appendChild(mk);
        pos = m.index + m[0].length;
      }
      var li = document.createElement("li"), c = document.createElement("code");
      c.textContent = m[0] === "" ? L("(vazio)", "(empty)") : m[0]; li.appendChild(c);
      var sub = document.createElement("span"); sub.className = "sub";
      var info = L("posição ", "index ") + m.index;
      for (var g = 1; g < m.length; g++) info += " · $" + g + " = " + (m[g] === undefined ? "∅" : JSON.stringify(m[g]));
      if (m.groups) Object.keys(m.groups).forEach(function (k) { info += " · " + k + " = " + (m.groups[k] === undefined ? "∅" : JSON.stringify(m.groups[k])); });
      sub.textContent = info; li.appendChild(sub); list.appendChild(li);
    });
    hl.appendChild(document.createTextNode(text.slice(pos)));
  }
  ["re-pattern", "re-flags", "re-text"].forEach(function (id) { $(id).addEventListener("input", regexRun); });

  /* ---------- JWT ---------- */
  function fmtDate(sec) { return new Date(sec * 1000).toLocaleString(lang === "en" ? "en-US" : "pt-BR"); }
  function jwtRun() {
    var st = $("jwt-status"), out = $("jwt-out");
    var tok = $("jwt-in").value.trim().replace(/^bearer\s+/i, "").replace(/\s+/g, "");
    out.hidden = true;
    if (!tok) return setStatus(st, null, "");
    var parts = tok.split(".");
    try {
      if (parts.length < 2) throw new Error("parts");
      var header = JSON.parse(utf8(bytesFromB64(parts[0]))), payload = JSON.parse(utf8(bytesFromB64(parts[1])));
      $("jwt-header").textContent = JSON.stringify(header, null, 2);
      $("jwt-payload").textContent = JSON.stringify(payload, null, 2);
      var claims = $("jwt-claims"), now = Date.now() / 1000, any = false;
      claims.textContent = "";
      [["iat", L("Emitido em (iat)", "Issued at (iat)")], ["nbf", L("Válido a partir de (nbf)", "Not before (nbf)")], ["exp", L("Expira em (exp)", "Expires at (exp)")]].forEach(function (c) {
        if (typeof payload[c[0]] !== "number") return;
        any = true;
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(c[1] + ": " + fmtDate(payload[c[0]])));
        if (c[0] === "exp") {
          var s = document.createElement("span"), expired = payload.exp < now;
          s.className = expired ? "exp-bad" : "exp-ok";
          s.textContent = " — " + (expired ? L("expirado", "expired") : L("ainda válido", "not expired"));
          li.appendChild(s);
        }
        claims.appendChild(li);
      });
      $("jwt-claims-box").hidden = !any;
      out.hidden = false;
      setStatus(st, true, "✓ " + L("Token decodificado (assinatura NÃO verificada).", "Token decoded (signature NOT verified)."));
    } catch (e) {
      setStatus(st, false, "✗ " + L("Token JWT inválido.", "Invalid JWT."));
    }
  }
  $("jwt-in").addEventListener("input", jwtRun);

  /* ---------- Hash (MD5 próprio; SHA via Web Crypto) ---------- */
  function md5(bytes) {
    var K = [], S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21], i;
    for (i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
    var len = bytes.length, n = (((len + 8) >>> 6) + 1) * 16, w = new Array(n).fill(0);
    for (i = 0; i < len; i++) w[i >> 2] |= bytes[i] << ((i % 4) * 8);
    w[len >> 2] |= 0x80 << ((len % 4) * 8);
    w[n - 2] = (len * 8) >>> 0; w[n - 1] = Math.floor((len * 8) / 4294967296);
    var a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
    for (var o = 0; o < n; o += 16) {
      var A = a0, B = b0, C = c0, D = d0;
      for (i = 0; i < 64; i++) {
        var F, g;
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | ~D); g = (7 * i) % 16; }
        F = (F + A + K[i] + w[o + g]) | 0;
        A = D; D = C; C = B;
        var s = S[(i >> 4) * 4 + (i % 4)];
        B = (B + ((F << s) | (F >>> (32 - s)))) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    var out = new Uint8Array(16);
    [a0, b0, c0, d0].forEach(function (v, j) { for (var k = 0; k < 4; k++) out[j * 4 + k] = (v >>> (k * 8)) & 255; });
    return hex(out);
  }
  var hashSeq = 0;
  function hashRun() {
    var out = $("hash-out"), seq = ++hashSeq, bytes = bytesOf($("hash-in").value), up = $("hash-upper").checked;
    var algos = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
    var subtle = window.crypto && crypto.subtle;
    Promise.all(algos.map(function (a) {
      return subtle ? subtle.digest(a, bytes).then(function (d) { return hex(new Uint8Array(d)); }) : Promise.resolve(L("(indisponível: requer HTTPS)", "(unavailable: requires HTTPS)"));
    })).then(function (res) {
      if (seq !== hashSeq) return;
      out.textContent = "";
      var rows = [["MD5", md5(bytes)]].concat(algos.map(function (a, i) { return [a, res[i]]; }));
      rows.forEach(function (r) { addRow(out, up ? r[1].toUpperCase() : r[1], r[0]); });
    });
  }
  $("hash-in").addEventListener("input", hashRun);
  $("hash-upper").addEventListener("change", hashRun);
  hashRun();

  /* ---------- Timestamp ---------- */
  function relTime(ms) {
    var diff = (ms - Date.now()) / 1000, abs = Math.abs(diff);
    var units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]];
    var rtf = new Intl.RelativeTimeFormat(lang === "en" ? "en" : "pt-BR", { numeric: "auto" });
    for (var i = 0; i < units.length; i++) {
      if (abs >= units[i][1] || i === units.length - 1) return rtf.format(Math.round(diff / units[i][1]), units[i][0]);
    }
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tsRun() {
    var st = $("ts-status"), out = $("ts-out"), raw = $("ts-in").value.trim();
    out.textContent = "";
    if (!raw) return setStatus(st, null, "");
    var n = Number(raw);
    if (!isFinite(n) || !/^-?\d+(\.\d+)?$/.test(raw)) return setStatus(st, false, "✗ " + L("Informe apenas números.", "Enter numbers only."));
    var ms = Math.abs(n) >= 1e11 ? n : n * 1000, d = new Date(ms);
    if (isNaN(d.getTime())) return setStatus(st, false, "✗ " + L("Data fora do intervalo.", "Date out of range."));
    setStatus(st, true, "✓ " + (Math.abs(n) >= 1e11 ? L("Interpretado como milissegundos.", "Read as milliseconds.") : L("Interpretado como segundos.", "Read as seconds.")));
    var loc = lang === "en" ? "en-US" : "pt-BR";
    addRow(out, d.toISOString(), "UTC (ISO 8601)");
    addRow(out, d.toLocaleString(loc, { dateStyle: "full", timeStyle: "medium" }), L("Local", "Local") + " (" + Intl.DateTimeFormat().resolvedOptions().timeZone + ")");
    addRow(out, relTime(ms), L("Relativo", "Relative"));
    addRow(out, String(Math.floor(ms / 1000)), L("Segundos", "Seconds"));
    addRow(out, String(Math.floor(ms)), L("Milissegundos", "Milliseconds"));
  }
  function dateRun() {
    var out = $("ts-out2"), v = $("ts-date").value;
    out.textContent = "";
    if (!v) return;
    var d = new Date(v);
    if (isNaN(d.getTime())) return;
    addRow(out, String(Math.floor(d.getTime() / 1000)), L("Segundos", "Seconds"));
    addRow(out, String(d.getTime()), L("Milissegundos", "Milliseconds"));
    addRow(out, d.toISOString(), "UTC (ISO 8601)");
  }
  function tickNow() { if (!document.getElementById("tool-tempo")) return; $("ts-now").textContent = Math.floor(Date.now() / 1000); }
  $("ts-in").addEventListener("input", tsRun);
  $("ts-date").addEventListener("input", dateRun);
  $("ts-use-now").addEventListener("click", function () { $("ts-in").value = Math.floor(Date.now() / 1000); tsRun(); });
  tickNow();
  if (document.getElementById("tool-tempo")) setInterval(tickNow, 1000);
  var nowD = new Date();
  $("ts-date").value = nowD.getFullYear() + "-" + pad(nowD.getMonth() + 1) + "-" + pad(nowD.getDate()) + "T" + pad(nowD.getHours()) + ":" + pad(nowD.getMinutes()) + ":" + pad(nowD.getSeconds());
  dateRun();
})();
