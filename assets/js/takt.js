/* The finder is a real query against the same schedule engine: it answers with
   the actual state of that block, and offers the nearest free run if it is taken. */
(function () {
  var R = window.Rozvrh;
  var form = document.querySelector("[data-finder]");
  if (!R || !form) return;

  var hallEl = form.querySelector("[data-f-hall]");
  var dateEl = form.querySelector("[data-f-date]");
  var fromEl = form.querySelector("[data-f-from]");
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

          out.innerHTML = "<b>" + name + " je volný</b> " + R.longDate(date) + ", " +
        R.hhmm(from) + "–" + R.hhmm(from + len) + " · " + R.czk(price);
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
