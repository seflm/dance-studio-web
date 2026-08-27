/* Site chrome: sticky header, mobile sheet, scroll reveal, live status chip. */
(function () {
  "use strict";

  /* header goes solid once the hero has scrolled past its own top edge */
  var hdr = document.querySelector(".hdr");
  if (hdr) {
    var onScroll = function () {
      hdr.dataset.stuck = String(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* mobile menu */
  var burger = document.querySelector(".burger");
  var sheet = document.querySelector(".sheet");
  if (burger && sheet) {
    var setOpen = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      sheet.dataset.open = String(open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      setOpen(burger.getAttribute("aria-expanded") !== "true");
    });
    sheet.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* scroll reveal — one observer, staggered inside each band */
  var rv = document.querySelectorAll(".rv");
  if (rv.length && "IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.dataset.in = "true";
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    rv.forEach(function (el) { el.dataset.in = "true"; });
  }

  /* the hero chip: what is actually free in the big hall today */
  var chip = document.querySelector("[data-chip]");
  if (chip && window.Rozvrh) {
    var free = window.Rozvrh.nextFreeToday("velky");
    var dot = chip.querySelector(".dot");
    var txt = chip.querySelector("[data-chip-text]");
    if (free) {
      txt.innerHTML = "Velký sál — dnes volno <b>" + window.Rozvrh.hhmm(free.from) +
                      "–" + window.Rozvrh.hhmm(free.to) + "</b>";
    } else {
      if (dot) dot.classList.add("dot--off");
      txt.innerHTML = "Velký sál — dnes už obsazeno, <b>zkuste zítra</b>";
    }
  }
})();
