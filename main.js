/* Martin Mashalov — personal site
   Three behaviours, nothing more:
   1. the hero decodes out of [MASK] tokens, the way a masked
      diffusion language model actually decodes a sequence
   2. the left rail reports real scroll position
   3. sections fade in once
*/

(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. the decode -------------------------------------- */

  function buildGlyphs(el) {
    const cells = [];
    el.querySelectorAll(".ln").forEach((line) => {
      const text = line.textContent;
      line.textContent = "";
      for (const ch of text) {
        const s = document.createElement("span");
        s.className = ch === " " ? "gl sp" : "gl";
        s.textContent = ch === " " ? " " : ch;
        if (ch !== " ") cells.push(s);
        line.appendChild(s);
      }
    });
    return cells;
  }

  function decode(el, meta) {
    const cells = buildGlyphs(el);
    if (reduced || cells.length === 0) {
      if (meta) meta.textContent = meta.dataset.done || "";
      return;
    }

    cells.forEach((c) => (c.dataset.state = "masked"));

    // Reveal order: shuffled, so the line resolves as a field rather
    // than left to right — that is what non-autoregressive decoding
    // looks like.
    const order = cells.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    const STEPS = 12;
    const STEP_MS = 105;
    let t = 0;

    const tick = () => {
      t += 1;
      // cosine schedule: slow, then a rush, then a settle
      const frac = (1 - Math.cos((Math.PI * t) / STEPS)) / 2;
      const target = Math.round(frac * cells.length);
      const done = cells.filter((c) => c.dataset.state === "revealed").length;

      for (let k = done; k < target; k++) {
        const cell = cells[order[k]];
        cell.dataset.state = "firing";
        setTimeout(() => (cell.dataset.state = "revealed"), 110);
      }

      if (meta) {
        meta.innerHTML =
          '<i class="dot"></i> masked-diffusion decode &nbsp;·&nbsp; step ' +
          String(t).padStart(2, "0") + " / " + STEPS +
          " &nbsp;·&nbsp; " + target + "/" + cells.length + " tokens";
      }

      if (t < STEPS) {
        setTimeout(tick, STEP_MS);
      } else {
        cells.forEach((c) => (c.dataset.state = "revealed"));
        setTimeout(() => {
          if (meta) meta.innerHTML = '<i class="dot"></i> ' + (meta.dataset.done || "");
        }, 420);
      }
    };

    setTimeout(tick, 260);
  }

  /* ---------- 2. the rail ---------------------------------------- */

  function railSpy() {
    const links = Array.from(document.querySelectorAll(".rail a"));
    if (!links.length) return;
    const targets = links
      .map((a) => ({ a, el: document.querySelector(a.getAttribute("href")) }))
      .filter((t) => t.el);

    const set = (active) =>
      targets.forEach((t) =>
        t.a.setAttribute("aria-current", t.el === active ? "true" : "false")
      );

    const onScroll = () => {
      const line = window.innerHeight * 0.38;
      let current = targets[0].el;
      for (const t of targets) {
        if (t.el.getBoundingClientRect().top <= line) current = t.el;
      }
      set(current);
    };

    let queued = false;
    window.addEventListener(
      "scroll",
      () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          onScroll();
          queued = false;
        });
      },
      { passive: true }
    );
    onScroll();
  }

  /* ---------- 3. reveal ------------------------------------------ */

  function reveal() {
    const items = document.querySelectorAll(".rv");
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- go -------------------------------------------------- */

  const start = () => {
    const h1 = document.querySelector("h1.decode");
    const meta = document.querySelector(".decode-meta");
    if (h1) decode(h1, meta);
    railSpy();
    reveal();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
