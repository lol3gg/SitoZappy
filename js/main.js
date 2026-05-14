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
    try {
      if (typeof window.matchMedia === "function" && window.matchMedia("(max-width: 960px)").matches) {
        markReady();
      } else {
        requestAnimationFrame(markReady);
      }
    } catch (err2) {
      requestAnimationFrame(markReady);
    }
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

  var navCloseTimer = null;
  var navCloseMs = reduceMotion ? 0 : 320;

  function clearNavCloseTimer() {
    if (navCloseTimer) {
      clearTimeout(navCloseTimer);
      navCloseTimer = null;
    }
  }

  function resetMobileNavUi() {
    clearNavCloseTimer();
    if (header) header.classList.remove("nav-open");
    if (nav) nav.classList.remove("is-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("nav-no-scroll");
  }

  function scheduleHeaderNavOpenOff() {
    clearNavCloseTimer();
    if (navCloseMs === 0) {
      if (header) header.classList.remove("nav-open");
      document.documentElement.classList.remove("nav-no-scroll");
      return;
    }
    navCloseTimer = setTimeout(function () {
      if (header) header.classList.remove("nav-open");
      document.documentElement.classList.remove("nav-no-scroll");
      navCloseTimer = null;
    }, navCloseMs);
  }

  window.addEventListener("pagehide", function () {
    resetMobileNavUi();
  });

  window.addEventListener("pageshow", function () {
    resetMobileNavUi();
    onScroll();
    updateParallax();
  });

  document.addEventListener(
    "click",
    function (e) {
      if (!nav || !nav.classList.contains("is-open")) return;
      var t = e.target;
      if (!t || !t.closest) return;
      var a = t.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (href === null || href === "" || href.indexOf("javascript:") === 0) return;
      resetMobileNavUi();
    },
    true
  );

  if (navToggle && nav && header) {
    resetMobileNavUi();

    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      if (open) {
        clearNavCloseTimer();
        header.classList.add("nav-open");
        navToggle.setAttribute("aria-expanded", "true");
        document.documentElement.classList.add("nav-no-scroll");
      } else {
        navToggle.setAttribute("aria-expanded", "false");
        scheduleHeaderNavOpenOff();
      }
    });
  }

  var logo = document.querySelector(".site-header .logo");
  if (logo) {
    logo.addEventListener("click", function () {
      resetMobileNavUi();
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
      var list = item.closest(".faq-list");
      if (!list) return;
      var wasOpen = item.classList.contains("is-open");
      list.querySelectorAll(".faq-item.is-open").forEach(function (openItem) {
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

  var yearFooter = document.getElementById("year");
  if (yearFooter) {
    yearFooter.textContent = String(new Date().getFullYear());
  }

  var contactForm = document.getElementById("form-contatti");
  if (contactForm) {
    var contactReveal = contactForm.closest(".reveal");
    if (contactReveal) {
      contactReveal.classList.add("is-visible");
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nomeEl = document.getElementById("contatto-nome");
      var cognomeEl = document.getElementById("contatto-cognome");
      var localeEl = document.getElementById("contatto-locale");
      var paeseEl = document.getElementById("contatto-paese");
      var argomentoEl = document.getElementById("contatto-argomento");
      var fields = [nomeEl, cognomeEl, localeEl, paeseEl, argomentoEl];
      fields.forEach(function (el) {
        if (el && typeof el.value === "string") {
          el.value = el.value.trim();
        }
      });
      fields.forEach(function (el) {
        if (el) el.setCustomValidity(el.value ? "" : "Compila questo campo.");
      });
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        fields.forEach(function (el) {
          if (el) el.setCustomValidity("");
        });
        return;
      }
      fields.forEach(function (el) {
        if (el) el.setCustomValidity("");
      });
      var nome = nomeEl ? nomeEl.value : "";
      var cognome = cognomeEl ? cognomeEl.value : "";
      var locale = localeEl ? localeEl.value : "";
      var paese = paeseEl ? paeseEl.value : "";
      var argomento = argomentoEl ? argomentoEl.value : "";
      var waPhone = "393793833583";
      var body = [
        "Ciao,",
        "",
        "Vorrei più informazioni riguardo a:",
        argomento,
        "",
        "- Dati -",
        "Nome: " + nome,
        "Cognome: " + cognome,
        "Locale: " + locale,
        "Paese: " + paese,
        "",
        "Grazie."
      ].join("\n");
      var encoded = encodeURIComponent(body);
      var url = "https://wa.me/" + waPhone + "?text=" + encoded;
      setTimeout(function () {
        window.location.assign(url);
      }, 0);
    });
  }
})();
