(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var nav = document.querySelector(".nav");
  var navToggle = document.querySelector(".nav-toggle");
  var reduceMotion = false;
  var ticking = false;

  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {}

  function markReady() {
    document.body.classList.add("is-ready");
  }

  if (reduceMotion) {
    markReady();
  } else {
    requestAnimationFrame(markReady);
  }

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 16) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  function updateParallax() {
    if (reduceMotion) return;
    var scrolled = window.scrollY || 0;
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var glow = hero.querySelector(".bg-glow");
    var mesh = hero.querySelector(".mesh");
    if (glow) {
      glow.style.transform = "translate3d(0," + Math.min(scrolled * 0.12, 36) + "px,0)";
    }
    if (mesh) {
      mesh.style.transform = "translate3d(0," + Math.min(scrolled * 0.08, 24) + "px,0)";
    }
  }

  function onScrollFrame() {
    ticking = false;
    onScroll();
    updateParallax();
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(onScrollFrame);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();
  updateParallax();

  if (navToggle && nav && header) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      header.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var revealEls = document.querySelectorAll(".reveal");
  var revealIndex = 0;
  revealEls.forEach(function (el) {
    if (
      el.classList.contains("delay-1") ||
      el.classList.contains("delay-2") ||
      el.classList.contains("delay-3") ||
      el.classList.contains("delay-4")
    ) {
      return;
    }
    el.style.setProperty("--reveal-delay", ((revealIndex % 5) * 0.04).toFixed(2) + "s");
    revealIndex += 1;
  });

  if (revealEls.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (!reduceMotion) {
    var interactiveCards = document.querySelectorAll(".glass-card, .app-card, .focus-card, .flow-highlight-card, .price-card");
    interactiveCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        card.style.setProperty("--mx", x.toFixed(3));
        card.style.setProperty("--my", y.toFixed(3));
      });
      card.addEventListener("mouseleave", function () {
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }

  document.querySelectorAll(".faq-item").forEach(function (item) {
    var trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", function () {
      var wasOpen = item.classList.contains("is-open");
      item.closest(".faq-list")
        .querySelectorAll(".faq-item.is-open")
        .forEach(function (openItem) {
          openItem.classList.remove("is-open");
          var t = openItem.querySelector(".faq-trigger");
          if (t) t.setAttribute("aria-expanded", "false");
        });
      if (!wasOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        var smooth = !reduceMotion;
        target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      }
    });
  });
})();
