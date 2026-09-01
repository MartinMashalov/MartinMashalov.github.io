/* Two behaviours: the left rail reports scroll position, and sections
   fade in once. */

(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    railSpy();
    reveal();

  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
