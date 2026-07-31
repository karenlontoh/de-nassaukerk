(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  revealEls.forEach(function (el) {
    var delay = el.getAttribute("data-reveal-delay");
    if (delay) el.style.setProperty("--reveal-delay", delay);
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    /* facts list items stagger via nth sibling within the same list */
    document.querySelectorAll(".facts__list").forEach(function (list) {
      var items = list.querySelectorAll(".facts__item");
      var listObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              items.forEach(function (item, i) {
                item.style.setProperty("--reveal-delay", i);
              });
              listObserver.disconnect();
            }
          });
        },
        { threshold: 0.1 }
      );
      listObserver.observe(list);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- nav scrolled state (sentinel, no scroll listener) ---------- */
  var nav = document.getElementById("nav");
  var sentinel = document.createElement("div");
  sentinel.style.position = "absolute";
  sentinel.style.top = "0";
  sentinel.style.height = "1px";
  sentinel.style.width = "1px";
  sentinel.setAttribute("aria-hidden", "true");
  document.body.prepend(sentinel);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- book showcase: shine-on-view + cursor tilt/spotlight ---------- */
  var stage = document.getElementById("bookStage");
  var book = document.getElementById("bookImg");

  if (stage && "IntersectionObserver" in window) {
    var stageObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            stageObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    stageObserver.observe(stage);
  }

  if (stage && book && !reduceMotion) {
    var raf = null;
    stage.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var rect = stage.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var ry = (px - 0.5) * 18;
        var rx = (0.5 - py) * 14;
        book.style.setProperty("--ry", ry.toFixed(2) + "deg");
        book.style.setProperty("--rx", rx.toFixed(2) + "deg");
        stage.style.setProperty("--spot-x", (px * 100).toFixed(1) + "%");
        stage.style.setProperty("--spot-y", (py * 100).toFixed(1) + "%");
        stage.style.setProperty("--shadow-x", (-(px - 0.5) * 40).toFixed(1) + "px");
        raf = null;
      });
    });
    stage.addEventListener("pointerleave", function () {
      book.style.setProperty("--ry", "-8deg");
      book.style.setProperty("--rx", "4deg");
      stage.style.setProperty("--shadow-x", "0px");
    });
  }
})();
