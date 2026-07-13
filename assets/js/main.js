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
  const rotator = document.getElementById("rotator");
  const rolesPT = ["Full Stack", "PHP / Laravel", "Integrações & APIs", "E-commerce"];
  const rolesEN = ["Full Stack", "PHP / Laravel", "Integrations & APIs", "E-commerce"];
  let rIdx = 0;
  const tickRotator = () => {
    const list = state.lang === "en" ? rolesEN : rolesPT;
    rIdx = (rIdx + 1) % list.length;
    rotator.style.opacity = "0";
    setTimeout(() => {
      rotator.textContent = list[rIdx];
      rotator.style.opacity = "1";
    }, 250);
  };
  rotator.style.transition = "opacity .25s ease";
  setInterval(tickRotator, 2600);

  /* ====================================================
     i18n  —  PT / EN
     ==================================================== */
  const I18N = {
    en: {
      "nav.about": "About", "nav.skills": "Skills", "nav.experience": "Experience",
      "nav.projects": "Projects", "nav.ai": "AI", "nav.contact": "Contact",
      "nav.download": "Download CV",

      "hero.eyebrow": "👋 Hi, I'm",
      "hero.role": "Back-End Developer",
      "hero.lead": "Over 25 years building scalable systems, APIs and integrations (REST, OAuth, ERPs), e-commerce and corporate solutions — from requirements to delivery. Focused on quality and AI-powered development.",
      "hero.ctaContact": "Get in touch", "hero.ctaWork": "See experience",
      "hero.stat1": "years of experience", "hero.stat2": "major brands",
      "hero.stat3": "PHP frameworks", "hero.stat4": "delivery focused",

      "about.title": "About me",
      "about.p1": "I'm a <strong>Full Stack Developer</strong> with over 25 years of experience in web development, covering the full project cycle: from requirements gathering to delivery and maintenance.",
      "about.p2": "I have solid experience with scalable systems, API integrations, e-commerce, corporate systems and custom solutions. I work well both in teams and independently, always focused on delivery and quality.",
      "about.p3": "More recently, I added <strong>generative AI (Claude Code)</strong> to my workflow to speed up development, refactor legacy code and debug more efficiently — delivering more, with more consistency.",
      "about.location": "Location", "about.objective": "Objective",
      "about.objectiveVal": "Back-End Developer", "about.langs": "Languages",
      "about.langsVal": "Portuguese / Advanced English",

      "skills.title": "Skills", "skills.backend": "Back-end", "skills.frontend": "Front-end",
      "skills.db": "Databases & Cache", "skills.devops": "DevOps & Cloud", "skills.ai": "AI in Development",
      "skills.integ": "Integrations", "skills.integTag1": "REST APIs", "skills.integTag2": "Payment gateways",
      "skills.aiTag1": "Refactoring", "skills.aiTag2": "Testing", "skills.aiTag3": "Code Review",

      "exp.title": "Experience", "exp.now": "Present", "exp.since": "Since 1999",
      "exp.r1": "Senior Developer Analyst",
      "exp.r1a": "Development and maintenance of the <strong>idplugger</strong> promotions & sweepstakes platform — a multi-tenant architecture (CakePHP, Laravel API, Redis and Python) serving everything from small businesses to major brands such as Bunge Alimentos, Óticas Carol and SERASA.",
      "exp.r1b": "Development of systems and API integrations (REST/OAuth) for clients such as Pearson (Wizard), Bunge and Anfarmag.",
      "exp.r2": "Senior Developer Analyst",
      "exp.r2a": "Projects for Total Express, Abril and Santander.",
      "exp.r2b": "Worked at a software factory.",
      "exp.r3": "IT Manager / Senior Developer",
      "exp.r3a": "Technical management and development.",
      "exp.r3b": "Projects for Atento, Avon and RRD.",
      "exp.r4": "Senior PHP Programmer Analyst",
      "exp.r4a": "POS systems for major brands (Sanofi, Whirlpool, Yoki, Ajinomoto, Kellogg's).",
      "exp.r5": "PHP Developer Analyst",
      "exp.r5a": "Projects for McDonald's and Telefônica/Vivo.",
      "exp.r6": "Web Developer Analyst", "exp.r6c": "Other companies",
      "exp.r6a": "Development in PHP, ASP and ASP.NET.",

      "proj.title": "Featured projects", "proj.live": "● Live",
      "proj.idt": "Promotions & Sweepstakes",
      "proj.idd": "Multi-tenant platform for campaigns, promotions and sweepstakes, serving everything from small businesses to major brands such as Bunge Alimentos, Óticas Carol and SERASA.",
      "proj.ept": "B2B Platform",
      "proj.epd": "B2B sales platform built with Vue.js and Laravel, integrated with the Bling ERP to sync products, stock and orders.",
      "proj.p1t": "Logistics System",
      "proj.p1d": "Internal parcel-tracking system, under continuous development since 2018, refactored with Zend Expressive.",
      "proj.logistics": "Logistics", "proj.webmobile": "(Web & Mobile)",
      "proj.p2d": "POS management and offline surveys, integrated with SAP and supporting mobile devices with image capture.",
      "proj.p3t": "Discount Clubs (E-commerce)",
      "proj.p3d": "E-commerce platform built from scratch, with payment (MOIP) and marketplace (Via Varejo) integrations.",
      "proj.p4d": "Corporate employee portal, built with Symfony and MySQL.", "proj.corporate": "Corporate",

      "ai.title": "AI-powered development",
      "ai.lead": "I integrate <strong>agentic generative AI</strong> into my daily development — notably <strong>Claude Code</strong>, Anthropic's CLI. Not as a replacement for engineering, but as a productivity multiplier I apply with technical judgment and careful review.",
      "ai.c1t": "Faster delivery", "ai.c1d": "Faster prototyping, scaffolding and feature implementation, keeping the existing code standards.",
      "ai.c2t": "Legacy refactoring", "ai.c2d": "Safely modernizing old codebases, improving readability, structure and maintainability.",
      "ai.c3t": "Efficient debugging", "ai.c3d": "Investigating complex bugs, analyzing stack traces and reproducing scenarios faster.",
      "ai.c4t": "Code review & tests", "ai.c4d": "Support for code review, test generation and documentation, raising delivery quality.",
      "ai.note": "💡 I believe the modern developer stands out not only for technical mastery, but for orchestrating AI responsibly — validating, testing and keeping control of the architecture.",

      "clients.title": "Clients served", "clients.sub": "Brands that trusted systems I helped build:",

      "edu.title": "Education", "edu.course": "Computer Science", "edu.year": "Completed in 2007",
      "lang.title": "Languages", "lang.pt": "Portuguese", "lang.native": "Native",
      "lang.en": "English", "lang.advanced": "Advanced (reading & speaking)",

      "contact.title": "Let's talk?",
      "contact.lead": "Open to opportunities and projects. Reach out through your preferred channel.",
      "contact.phone": "Phone / WhatsApp", "contact.location": "Location",
      "contact.download": "⬇ Download résumé (PDF)",
      "footer.made": "Built with HTML, CSS, JS — and a touch of Claude Code 🤖"
    }
  };

  const state = { lang: localStorage.getItem("lang") || "pt" };

  // Guarda os textos originais (PT) na primeira execução
  const ptStore = new Map();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    ptStore.set(el, el.innerHTML);
  });

  const applyLang = (lang) => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (lang === "en" && I18N.en[key] != null) {
        el.innerHTML = I18N.en[key];
      } else {
        el.innerHTML = ptStore.get(el);
      }
    });
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
    document.getElementById("langLabel").textContent = lang === "en" ? "PT" : "EN";
    state.lang = lang;
    localStorage.setItem("lang", lang);
  };

  document.getElementById("langToggle").addEventListener("click", () => {
    applyLang(state.lang === "en" ? "pt" : "en");
  });

  if (state.lang === "en") applyLang("en");
})();
