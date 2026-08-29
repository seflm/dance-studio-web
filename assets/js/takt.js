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
  fromEl.addEventListener("change", fillTo);

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

    /* three views of the same hall, crossfading */
  (function () {
    var wrap = document.querySelector("[data-slides]");
    if (!wrap) return;
    var imgs = wrap.querySelectorAll("img");
    if (imgs.length < 2) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var i = 0;
    setInterval(function () {
      imgs[i].removeAttribute("data-on");
      i = (i + 1) % imgs.length;
      imgs[i].setAttribute("data-on", "true");
    }, 5000);
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
      body: "Taneční škola Jiřího Švarce a Miriam Zedníčkové, zaměřená na West Coast Swing — moderní párový tanec postavený na improvizaci a vedení. Kurzy od úplných začátečníků po pokročilé, workshopy s hostujícími lektory a pravidelné taneční party. Jirka zároveň patří k lidem, kteří studio zakládají — podmínky proto platí pro všechny školy stejně.",
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
