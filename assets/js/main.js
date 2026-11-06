/* =========================================================
   Fábio Fila — interações do site
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Ano no rodapé ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Tema claro/escuro ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;
  const savedTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.setAttribute("data-theme", savedTheme);
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Menu mobile ---------- */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Nav: sombra ao rolar + voltar ao topo ---------- */
  const nav = document.getElementById("nav");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 10);
    toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  /* ---------- Reveal ao entrar na viewport ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Contadores animados ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "+";
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count + (c.dataset.suffix || "+")));
  }

  /* ---------- Nav ativo conforme seção ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navAnchors = navLinks.querySelectorAll("a");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navAnchors.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  /* ---------- Rotator de cargos ---------- */
  const isEN = document.documentElement.lang === "en";
  const rotator = document.getElementById("rotator");
  const rolesPT = ["Full Stack", "PHP / Laravel", "Integrações & APIs", "E-commerce"];
  const rolesEN = ["Full Stack", "PHP / Laravel", "Integrations & APIs", "E-commerce"];
  let rIdx = 0;
  const tickRotator = () => {
    const list = isEN ? rolesEN : rolesPT;
    rIdx = (rIdx + 1) % list.length;
    rotator.style.opacity = "0";
    setTimeout(() => {
      rotator.textContent = list[rIdx];
      rotator.style.opacity = "1";
    }, 250);
  };
  rotator.style.transition = "opacity .25s ease";
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(tickRotator, 2600);
  }

  /* ====================================================
     Idioma  —  PT (/) e EN (/en/) são páginas separadas, geradas por
     scripts/build.mjs. Aqui só lembramos a escolha e trocamos de página.
     ==================================================== */
  const toggle = document.getElementById("langToggle");
  try {
    localStorage.setItem("lang", isEN ? "en" : "pt");
    // o link leva ao outro idioma: grava a escolha antes de navegar
    toggle.addEventListener("click", () => localStorage.setItem("lang", isEN ? "pt" : "en"));
  } catch (e) {}
})();
