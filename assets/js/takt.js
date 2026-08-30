/* The finder is a real query against the same schedule engine: it answers with
   the actual state of that block, and offers the nearest free run if it is taken. */
(function () {
  var R = window.Rozvrh;
  var form = document.querySelector("[data-finder]");
  if (!R || !form) return;

  var hallEl = form.querySelector("[data-f-hall]");
  var dateEl = form.querySelector("[data-f-date]");
  var fromEl = form.querySelector("[data-f-from]");
  var purpEl = form.querySelector("[data-f-purpose]");
    var toEl   = form.querySelector("[data-f-to]");
  var out    = document.querySelector("[data-result]");

  var OPEN = R.STUDIO.openFrom, CLOSE = R.STUDIO.openTo;
  var today = new Date();

  for (var h = OPEN; h < CLOSE; h++) {
    var o = document.createElement("option");
    o.value = h;
    o.textContent = R.hhmm(h);
    if (h === 19) o.selected = true;      // the hour every school asks for first
    fromEl.appendChild(o);
  }
    for (var i = 0; i < 21; i++) {
    var d = R.addDays(today, i);
    var opt = document.createElement("option");
    opt.value = R.iso(d);
    opt.textContent = (i === 0 ? "Dnes" : i === 1 ? "Zítra"
      : R.DAYS[(d.getDay() + 6) % 7]) + " " + d.getDate() + ". " + (d.getMonth() + 1) + ".";
    dateEl.appendChild(opt);
  }

  /* --- the phone trigger --------------------------------------------------
     The finder is a cream panel the height of half a phone screen, so on
     small viewports it starts folded and says what it would look for. CSS
     decides whether the trigger is on screen at all; this only keeps its
     label truthful and toggles the state. */
  var toggle  = form.querySelector("[data-finder-toggle]");
  var summary = form.querySelector("[data-finder-summary]");

  function retitle() {
    if (!summary) return;
    var d = dateEl.options[dateEl.selectedIndex];
    // the chip has one line to work with, so "Dnes 29. 8." loses its date
    var when = d ? d.textContent : "";
    if (/^(Dnes|Zítra)/.test(when)) when = when.split(" ")[0];
    // every slot is a whole hour, so ":00" is six characters of nothing —
    // and at 320px the chip has about 195 to work with
    summary.textContent =
      hallEl.options[hallEl.selectedIndex].text.split(" — ")[0] + " · " +
      when.toLowerCase() + " " +
      Number(fromEl.value) + "–" + Number(toEl.value) + " h";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = form.dataset.open !== "true";
      form.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      if (open) {
        hallEl.focus({ preventScroll: true });
        // opened from the fold, the panel runs off the bottom; bring it up
        form.scrollIntoView({ block: "end", behavior:
          window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    });
    form.addEventListener("change", retitle);
  }

  /* "Do" is an end time, not a count of hours, so it tracks "Od" */
  function fillTo() {
    var start = Number(fromEl.value), want = start + 2;
    toEl.innerHTML = "";
    for (var t = start + 1; t <= CLOSE; t++) {
      var op = document.createElement("option");
      op.value = t; op.textContent = R.hhmm(t);
      toEl.appendChild(op);
    }
    toEl.value = String(Math.min(Math.max(want, start + 1), CLOSE));
  }
  fillTo();
  retitle();
  fromEl.addEventListener("change", function () { fillTo(); retitle(); });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var hall = hallEl.value;
    var date = new Date(dateEl.value + "T00:00:00");
    if (isNaN(date)) return;

        var from = Number(fromEl.value);
    var len  = Number(toEl.value) - from;
    var occ  = R.occupancyOn(hall, date);
    var name = R.STUDIO.halls[hall].name;

    var clash = null, price = 0;
    for (var i = 0; i < len; i++) {
      var hh = from + i;
      if (hh >= CLOSE) { clash = "close"; break; }
      if (occ[hh]) { clash = R.hhmm(hh); break; }
      price += R.hourPrice(hall, date, hh);
    }

    out.hidden = false;
    out.classList.toggle("fresult--no", Boolean(clash));

    if (clash === "close") {
      out.innerHTML = "<b>Zavíráme ve 22:00.</b> " + name + " si od " +
        R.hhmm(from) + " můžete vzít na " + (CLOSE - from) + " h.";
      return;
    }
    if (clash) {
      // offer the run closest to what was asked for, in either direction —
      // someone who wanted 19:00 will usually take 17:00
      var alt = null, bestGap = Infinity;
      for (var s = OPEN; s + len <= CLOSE; s++) {
        var ok = true;
        for (var k = 0; k < len; k++) if (occ[s + k]) { ok = false; break; }
        if (!ok) continue;
        var gap = Math.abs(s - from);
        if (gap < bestGap) { bestGap = gap; alt = s; }
      }
      out.innerHTML = "<b>V ten čas je obsazeno</b> (od " + clash + "). " +
        (alt !== null
          ? name + " je volný " + R.hhmm(alt) + "–" + R.hhmm(alt + len) + "."
          : "Ten den už " + len + " h v řadě nenajdeme — zkuste jiný.");
      return;
    }

    if (purpEl) {
      // remember it for the booking form; a failed write is not worth an error
      try { window.localStorage.setItem("takt.purpose", purpEl.value); } catch (e) {}
    }
    out.innerHTML = "<b>" + name + " je volný</b> " + R.longDate(date) + ", " +
      R.hhmm(from) + "–" + R.hhmm(from + len) + " · " + R.czk(price) +
      (purpEl ? " · " + purpEl.value.toLowerCase() : "");
  });

  /* The hero background: three stills that crossfade, with a muted YouTube
     loop laid over them once it is actually playing. The stills stay beneath
     so the hero is never blank — autoplay is refused often enough on mobile,
     and the embed is skipped entirely for reduced motion. */
  (function () {
    var wrap = document.querySelector("[data-slides]");
    if (!wrap) return;
    var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var imgs = wrap.querySelectorAll("img");
    if (imgs.length > 1 && !calm) {
      var i = 0;
      setInterval(function () {
        imgs[i].removeAttribute("data-on");
        i = (i + 1) % imgs.length;
        imgs[i].setAttribute("data-on", "true");
      }, 5000);
    }

    var src = wrap.dataset.video;
    if (!src || calm) return;
    // a background flourish is not worth someone's data allowance
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || /^([23]g|slow-2g)$/.test(conn.effectiveType || ""))) return;
    var from = Number(wrap.dataset.from) || 0;
    var to   = Number(wrap.dataset.to)   || 0;

    /* The video is the heaviest thing on the site and the least urgent — the
       hero already looks finished without it. So nothing is requested until
       the page has finished loading, and then only once the browser says it
       is idle. Until then the photographs are doing the job. */
    function later(fn) {
      var go = function () {
        if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 2500 });
        else setTimeout(fn, 300);
      };
      if (document.readyState === "complete") go();
      else window.addEventListener("load", go, { once: true });
    }

    /* Everything below runs inside later(). Assigning .src is what starts the
       download — an element built early would fetch early even while detached
       from the document, which is exactly what we are trying to avoid. */
    later(function () {
      var v = document.createElement("video");
      v.className = "hero__vid";
      v.muted = true;              // the property, not just the attribute:
      v.defaultMuted = true;       // Safari checks this one before autoplaying
      v.loop = !to;                // with a window we do the looping ourselves
      v.autoplay = true;
      v.playsInline = true;
      v.preload = "auto";
      v.setAttribute("tabindex", "-1");
      v.setAttribute("aria-hidden", "true");
      v.disablePictureInPicture = true;

      /* The photographs hold the hero until the video is genuinely running, so
         a missing file, a decode error or a refused autoplay all end up in the
         same harmless place: the stills stay. */
      function reveal() { wrap.dataset.playing = "true"; }
      function fallBack() { delete wrap.dataset.playing; }
      v.addEventListener("playing", reveal);
      v.addEventListener("stalled", fallBack);
      v.addEventListener("error", fallBack);

      /* Loop a section rather than the whole file. Hand me a clip that is
         already trimmed, drop data-from/data-to, and it loops natively. */
      if (from) {
        v.addEventListener("loadedmetadata", function () {
          if (v.duration > from) { try { v.currentTime = from; } catch (e) {} }
        });
      }
      if (to) {
        v.addEventListener("timeupdate", function () {
          if (v.currentTime >= to || v.currentTime < from - 1) {
            try { v.currentTime = from; } catch (e) {}
            if (v.paused) v.play().catch(function () {});
          }
        });
      }

      v.src = src;                 // the fetch starts here, and not before
      wrap.appendChild(v);
      var started = v.play();
      if (started && started.catch) started.catch(fallBack);
    });
  })();

  /* the week at a glance, folded under the bar */
  var peekBtn = document.querySelector("[data-peek]");
  var cal = document.querySelector("[data-cal]");
  if (peekBtn && cal) {
    var calRow = cal.querySelector("[data-cal-row]");
    var days = R.outlook("velky", 7);
    var nextFree = R.nextFreeBlock("velky", 7);
    var hint = document.querySelector("[data-peek-hint]");
    if (hint) {
      hint.textContent = nextFree
        ? "Nejbližší volno " + nextFree.when + " " + R.hhmm(nextFree.from) + "–" + R.hhmm(nextFree.to)
        : days.reduce(function (a, d) { return a + d.free; }, 0) + " volných hodin tento týden";
    }
    calRow.innerHTML = days.map(function (d) {
      var full = d.free === 0;
      return '<button class="cal__d" type="button" data-date="' + d.iso + '">' +
        '<span class="cal__dn">' + (d.today ? "Dnes" : d.day) + '</span>' +
        '<span class="cal__dd">' + d.dayNum.replace(/\.$/, "") + '</span>' +
        '<span class="cal__h" data-full="' + full + '">' +
          (full ? "obsazeno" : d.free + " h volných") + '</span>' +
      '</button>';
    }).join("");
    peekBtn.addEventListener("click", function () {
      var open = cal.dataset.open !== "true";
      cal.dataset.open = String(open);
      peekBtn.setAttribute("aria-expanded", String(open));
    });
    calRow.addEventListener("click", function (ev) {
      var el = ev.target.closest("[data-date]");
      if (!el) return;
      dateEl.value = el.dataset.date;
      cal.dataset.open = "false";
      peekBtn.setAttribute("aria-expanded", "false");
      out.hidden = true;
    });
  }
})();


/* Partner carousel — one real school in the middle, the open places say so.
   The logo row doubles as the navigation. */
(function () {
  var MARK = '<svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">' +
    '<circle cx="26" cy="26" r="25" stroke="currentColor"/>' +
    '<path d="M26 17v18M17 26h18" stroke="currentColor"/></svg>';
  var SMALL = '<svg width="26" height="26" viewBox="0 0 52 52" fill="none" aria-hidden="true">' +
    '<circle cx="26" cy="26" r="25" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M26 17v18M17 26h18" stroke="currentColor" stroke-width="2"/></svg>';

  var SLIDES = [
    { nav: "Puls", title: "Puls", logo: "assets/img/partners/puls.svg",
      body: "Taneční studio zaměřené na latinskoamerické tance a sociální večery. Kurzy pro dospělé a pravidelné páteční party." },
    { nav: "Krok", title: "Krok", logo: "assets/img/partners/krok.svg",
      body: "Škola společenského tance pro dospělé — od úplných základů po pokročilé, s důrazem na vedení a držení." },
    { nav: "Simply the West", title: "Simply the West", logo: "assets/img/partner-simplythewest-mono.png",
      body: "Taneční škola Jiřího Švarce a Miriam Zedníčkové, zaměřená na West Coast Swing — moderní párový tanec postavený na improvizaci a vedení. Kurzy od úplných začátečníků po pokročilé, workshopy s hostujícími lektory a pravidelné taneční party.",
      link: "https://www.simplythewest.cz/", linkLabel: "simplythewest.cz ↗" },
    { nav: "Rytmus", title: "Rytmus", logo: "assets/img/partners/rytmus.svg",
      body: "Kurzy pro děti a mládež — moderna, street a základy jevištního pohybu. Vystoupení dvakrát ročně." },
    { nav: "Vlna", title: "Vlna", logo: "assets/img/partners/vlna.svg",
      body: "Contemporary a improvizace. Otevřené hodiny, na které se nemusíte hlásit dopředu, a víkendové intenzivy." }
  ];

  var car = document.querySelector("[data-car]");
  if (!car) return;
  var track = car.querySelector("[data-car-track]");
  var nav = car.querySelector("[data-car-nav]");

  track.innerHTML = SLIDES.map(function (s, i) {
        var inner =
      '<div class="pslide__logo"><img src="' + s.logo + '" alt="Logo ' + s.title + '" width="300" height="120" loading="lazy"></div>' +
      '<span class="tag tag--l">Partnerská škola</span>' +
      '<p>' + s.body + '</p>' +
      (s.link
        ? '<p><a class="btn btn--gl" href="' + s.link + '" target="_blank" rel="noopener">' + s.linkLabel + '</a></p>'
        : '<p><a class="btn btn--gl" href="#finder">Zjistit víc</a></p>');
    return '<div class="car__slide" role="group" aria-roledescription="slide" aria-label="' +
           (i + 1) + ' z ' + SLIDES.length + '"><div class="pslide">' + inner + '</div></div>';
  }).join("");

    nav.innerHTML = SLIDES.map(function (s, i) {
    var fig = '<span class="slot__fig"><img src="' + s.logo + '" alt="" width="300" height="120" loading="lazy"></span>';
    return '<li><button class="slot" type="button" data-go="' + i + '">' + fig +
      '<span class="slot__rule" aria-hidden="true"></span>' +
      '<span class="slot__lbl">' + s.nav + '</span></button></li>';
  }).join("");

  var slides = track.querySelectorAll(".car__slide");
  var dots = nav.querySelectorAll(".slot");

  function go(i) {
    var n = SLIDES.length;
    i = (i % n + n) % n;
    track.style.transform = "translateX(" + (-i * 100) + "%)";
    slides.forEach(function (el, k) {
      el.setAttribute("aria-hidden", String(k !== i));
      el.querySelectorAll("a").forEach(function (a) { a.tabIndex = k === i ? 0 : -1; });
    });
    dots.forEach(function (el, k) { el.setAttribute("aria-current", String(k === i)); });
  }
  dots.forEach(function (el, i) { el.addEventListener("click", function () { go(i); }); });
  nav.addEventListener("keydown", function (e) {
    var cur = [].indexOf.call(dots, document.activeElement);
    if (cur < 0) return;
    if (e.key === "ArrowRight") { e.preventDefault(); var n1 = (cur + 1) % dots.length; dots[n1].focus(); go(n1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); var n2 = (cur - 1 + dots.length) % dots.length; dots[n2].focus(); go(n2); }
  });
  go(2);
})();

/* The sticky mobile header has no fixed height — it wraps differently by
   width and by font — so anything that has to sit under it (anchor offsets,
   the schedule's day row) reads it from here rather than guessing. */
(function () {
  // subpages wrap the bar in .top--solid; the homepage bar is the header
  // itself, floating over the hero
  var bar = document.querySelector(".top--solid") || document.querySelector(".top");
  if (!bar) return;
  function measure() {
    document.documentElement.style.setProperty("--top-h", bar.offsetHeight + "px");
  }
  measure();
  window.addEventListener("resize", measure);
  if (window.ResizeObserver) new ResizeObserver(measure).observe(bar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

})();

/* The mobile menu. The panel is the same <nav> the desktop bar uses, so there
   is one set of links in the document; CSS decides whether it is a row or a
   drawer. Everything here is state and focus: the styling knows nothing. */
(function () {
  var burger = document.querySelector("[data-menu]");
  var menu   = document.getElementById("menu");
  var scrim  = document.querySelector("[data-scrim]");
  if (!burger || !menu) return;

  var closer = menu.querySelector("[data-menu-close]");
  var open = false;

  function setOpen(next) {
    open = next;
    menu.dataset.open = String(next);
    burger.setAttribute("aria-expanded", String(next));
    burger.setAttribute("aria-label", next ? "Zavřít menu" : "Otevřít menu");
    if (scrim) scrim.dataset.open = String(next);
    document.body.classList.toggle("menu-open", next);
    // focus lands inside the panel on open and comes back to the burger after
    if (next) { (closer || menu.querySelector("a")).focus(); }
    else if (document.activeElement && menu.contains(document.activeElement)) { burger.focus(); }
  }

  burger.addEventListener("click", function () { setOpen(!open); });
  if (closer) closer.addEventListener("click", function () { setOpen(false); });
  if (scrim)  scrim.addEventListener("click", function () { setOpen(false); });

  // a link inside the drawer navigates; same-page anchors need it closed first
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); return; }
    if (e.key !== "Tab") return;
    // keep Tab inside the panel while it covers the page
    var f = menu.querySelectorAll("a[href], button:not([disabled])");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // dragging the window past the breakpoint must not strand the open state
  var wide = window.matchMedia("(min-width: 940px)");
  var onWide = function (m) { if (m.matches && open) setOpen(false); };
  if (wide.addEventListener) wide.addEventListener("change", onWide);
  else if (wide.addListener) wide.addListener(onWide);
})();
