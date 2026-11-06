/**
 * Portfolio interactions — dependency-free, progressive enhancement.
 *
 * Every module:
 *   - guards against missing DOM nodes (safe to reuse on other pages)
 *   - respects `prefers-reduced-motion`
 *   - batches scroll work into a single requestAnimationFrame
 */
(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduceMotion = () => prefersReducedMotion.matches;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  /* ----------------------------------------------------------------------
   * Scroll scheduler: one passive listener + rAF, shared by all modules.
   * -------------------------------------------------------------------- */
  const scrollCallbacks = new Set();
  let ticking = false;

  const runScrollCallbacks = () => {
    scrollCallbacks.forEach((cb) => cb());
    ticking = false;
  };

  const onScroll = (cb) => {
    scrollCallbacks.add(cb);
    cb(); // initial paint
  };

  const requestTick = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(runScrollCallbacks);
    }
  };

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick, { passive: true });

  /* ----------------------------------------------------------------------
   * Header: frosted glass after scrolling.
   * -------------------------------------------------------------------- */
  function initHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    onScroll(() => header.classList.toggle("is-scrolled", window.scrollY > 10));
  }

  /* ----------------------------------------------------------------------
   * Mobile menu: accessible toggle (aria-expanded, Esc, link click, resize).
   * -------------------------------------------------------------------- */
  function initMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset state when crossing to the desktop layout
    window.matchMedia("(min-width: 769px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ----------------------------------------------------------------------
   * Active nav link: highlight the section currently in view.
   * -------------------------------------------------------------------- */
  function initActiveLink() {
    const links = document.querySelectorAll(".nav__link[href^='#']");
    if (!links.length || !("IntersectionObserver" in window)) return;

    const linkById = new Map(
      [...links].map((link) => [link.getAttribute("href").slice(1), link])
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove("is-active"));
          linkById.get(entry.target.id)?.classList.add("is-active");
        });
      },
      // A thin band across the middle of the viewport decides the "current" section
      { rootMargin: "-45% 0px -50% 0px" }
    );

    document.querySelectorAll("main section[id]").forEach((s) => observer.observe(s));
  }

  /* ----------------------------------------------------------------------
   * Hero: exposes scroll progress (0 → 1) as a CSS variable so CSS can
   * scale/fade the hero away like an Apple product page.
   * -------------------------------------------------------------------- */
  function initHeroScroll() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    onScroll(() => {
      if (reduceMotion()) {
        hero.style.setProperty("--hero-progress", "0");
        return;
      }
      const height = hero.offsetHeight || 1;
      const progress = clamp(window.scrollY / (height * 0.9));
      hero.style.setProperty("--hero-progress", progress.toFixed(4));
    });
  }

  /* ----------------------------------------------------------------------
   * Role rotator: cycles words with a blur/slide transition.
   * -------------------------------------------------------------------- */
  function initRotator() {
    const el = document.querySelector(".rotator[data-words]");
    if (!el) return;

    const words = el.dataset.words.split("|").map((w) => w.trim()).filter(Boolean);
    if (words.length < 2) return;

    const HOLD_MS = 2400;
    const OUT_MS = 450;
    let index = 0;
    let timer = null;

    const next = () => {
      if (reduceMotion() || document.hidden) return schedule();

      el.classList.add("is-out");
      setTimeout(() => {
        index = (index + 1) % words.length;
        el.textContent = words[index];
        // Jump to the "below" position without transition, then animate in
        el.classList.remove("is-out");
        el.classList.add("is-in");
        void el.offsetWidth; // force reflow so the next class change animates
        el.classList.remove("is-in");
        schedule();
      }, OUT_MS);
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(next, HOLD_MS);
    };

    schedule();
  }

  /* ----------------------------------------------------------------------
   * Statement: split into words and light them up based on scroll position.
   * -------------------------------------------------------------------- */
  function initWordHighlight() {
    const el = document.querySelector("[data-highlight]");
    if (!el) return;

    // Build word spans with DOM APIs (no innerHTML → no injection surface)
    const text = el.textContent.trim().replace(/\s+/g, " ");
    el.setAttribute("aria-label", text);
    el.textContent = "";

    const words = text.split(" ").map((word, i, arr) => {
      const span = document.createElement("span");
      span.className = "word";
      span.setAttribute("aria-hidden", "true");
      span.textContent = word;
      el.appendChild(span);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
      return span;
    });

    let lastLit = -1;

    onScroll(() => {
      let lit;
      if (reduceMotion()) {
        lit = words.length;
      } else {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // Starts lighting when the block enters the lower 15% of the viewport,
        // finishes when its bottom reaches ~40% from the top.
        const start = vh * 0.85;
        const end = vh * 0.4;
        const progress = clamp((start - rect.top) / (start - end + rect.height));
        lit = Math.round(progress * words.length);
      }

      if (lit === lastLit) return; // avoid redundant DOM writes
      lastLit = lit;
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
    });
  }

  /* ----------------------------------------------------------------------
   * Scroll reveal: fade/rise elements in once, with stagger inside groups.
   * -------------------------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    // Stagger children of a [data-reveal-group]
    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      group.querySelectorAll("[data-reveal]").forEach((child, i) => {
        child.style.setProperty("--delay", `${i * 110}ms`);
      });
    });

    if (reduceMotion() || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("is-visible");
          obs.unobserve(el); // animate once
          // Drop the stagger delay afterwards so hover transitions stay instant
          el.addEventListener("transitionend", () => el.style.setProperty("--delay", "0ms"), {
            once: true,
          });
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------------------
   * Spotlight: radial glow that follows the pointer over cards.
   * -------------------------------------------------------------------- */
  function initSpotlight() {
    // Skip on touch-only devices — there is no hover
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll(".spotlight").forEach((card) => {
      card.addEventListener(
        "pointermove",
        (event) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          card.style.setProperty("--my", `${event.clientY - rect.top}px`);
        },
        { passive: true }
      );
    });
  }

  /* ----------------------------------------------------------------------
   * Footer year.
   * -------------------------------------------------------------------- */
  function initYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------------- */
  const init = () => {
    initHeader();
    initMobileMenu();
    initActiveLink();
    initHeroScroll();
    initRotator();
    initWordHighlight();
    initReveal();
    initSpotlight();
    initYear();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
