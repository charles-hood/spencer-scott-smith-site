/* Spencer Scott Smith — site behavior
   Vanilla JS, no dependencies. Progressive enhancement: every embed has a
   no-JS fallback link, so nothing here is load-bearing for content access. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Page-load hero stagger -----------------------------------------
     <html class="preload"> hides the hero items; adding body.loaded animates
     them in (the .loaded rule overrides .preload). No-JS users get a <noscript>
     override so nothing stays hidden. */
  var reveal = function () { document.body.classList.add("loaded"); };
  window.addEventListener("load", reveal);
  document.addEventListener("DOMContentLoaded", function () {
    requestAnimationFrame(reveal); // fire even if a sub-resource stalls
    initHeader();
    initNav();
    initReveal();
    initFacades();
    initLazyScripts();
  });

  /* --- Sticky header condense ----------------------------------------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile nav ------------------------------------------------------ */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    var close = function () {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* --- Reveal on scroll ------------------------------------------------ */
  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --- Embed facades (click-to-load) ----------------------------------
     Markup: <button class="facade" data-embed="youtube|spotify|spotify-compact|apple" data-id="...">…</button>
     Builds the real iframe only on activation, keeping initial paint light. */
  function initFacades() {
    var FRAMES = {
      youtube: function (id) {
        return frame(
          "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0",
          "embed-frame video",
          "Spencer Scott Smith — video",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          true
        );
      },
      spotify: function (id) {
        return frame("https://open.spotify.com/embed/" + id + "?utm_source=generator&theme=0",
          "embed-frame spotify", "Spotify player", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture", true);
      },
      "spotify-compact": function (id) {
        return frame("https://open.spotify.com/embed/" + id + "?utm_source=generator&theme=0",
          "embed-frame spotify-compact", "Spotify player", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture", true);
      },
      apple: function (id) {
        return frame("https://embed.music.apple.com/" + id,
          "embed-frame apple", "Apple Music player", "autoplay *; encrypted-media *;", true);
      }
    };

    function frame(src, cls, title, allow, allowFs) {
      var f = document.createElement("iframe");
      f.src = src; f.className = cls; f.title = title; f.loading = "eager";
      f.setAttribute("frameborder", "0");
      if (allow) f.setAttribute("allow", allow);
      if (allowFs) f.setAttribute("allowfullscreen", "");
      return f;
    }

    document.querySelectorAll(".facade").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var type = btn.getAttribute("data-embed");
        var id = btn.getAttribute("data-id");
        var build = FRAMES[type];
        if (!build || !id) return;
        var iframe = build(id);
        btn.replaceWith(iframe);
        // move focus into the freshly loaded player for keyboard users
        iframe.setAttribute("tabindex", "-1");
        try { iframe.focus({ preventScroll: true }); } catch (e) {}
      });
    });
  }

  /* --- Lazy third-party scripts (Bandsintown, Juicer) ------------------
     Markup: <div data-lazy-script="https://…/x.js" [data-lazy-css="…"]>…</div>
     The script/css inject only when the host scrolls near the viewport, so
     they never block first paint. Content still has a plain-link fallback. */
  function initLazyScripts() {
    var hosts = document.querySelectorAll("[data-lazy-script]");
    if (!hosts.length) return;

    var load = function (host) {
      if (host.dataset.loaded) return;
      host.dataset.loaded = "1";
      var css = host.getAttribute("data-lazy-css");
      if (css) {
        var link = document.createElement("link");
        link.rel = "stylesheet"; link.href = css;
        document.head.appendChild(link);
      }
      var s = document.createElement("script");
      s.src = host.getAttribute("data-lazy-script");
      s.async = true;
      s.setAttribute("charset", "utf-8");
      document.body.appendChild(s);
    };

    if (!("IntersectionObserver" in window)) {
      hosts.forEach(load);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { load(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: "400px 0px" }); // pre-load a bit early so it's ready on arrival
    hosts.forEach(function (h) { io.observe(h); });
  }
})();
