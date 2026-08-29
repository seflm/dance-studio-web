/* Rezervace — wires the shared hour ledger to the form and the receipt.
   Nothing leaves the browser; the confirmation is rendered locally. */
(function () {
  var R = window.Rozvrh;
  var root = document.querySelector("[data-rozvrh]");
  if (!R || !root) return;

  var grid    = R.create(root, { hall: "velky" });
  var form    = document.getElementById("bookform");
  var lines   = document.querySelector("[data-lines]");
  var totals  = document.querySelector("[data-totals]");
  var errBox  = document.querySelector("[data-err]");
  var repeat  = document.querySelector("[data-repeat]");
  var rToggle = document.querySelector("[data-repeat-toggle]");
  var weeksEl = document.querySelector("[data-weeks]");
  var stageForm = document.querySelector('[data-stage="form"]');
  var stageDone = document.querySelector('[data-stage="done"]');

  var HALLS = R.STUDIO.halls;
  var TERM_FROM = 10;   // weeks at which the semester rate applies

  document.querySelectorAll('input[name="hall"]').forEach(function (el) {
    el.addEventListener("change", function () { grid.setHall(el.value); });
  });

  rToggle.addEventListener("change", function () {
    repeat.dataset.on = String(rToggle.checked);
    paint();
  });
  weeksEl.addEventListener("change", paint);

  function weeks() { return rToggle.checked ? Number(weeksEl.value) : 1; }
  function useTerm() { return rToggle.checked && weeks() >= TERM_FROM; }

  /* One place decides money: per-week price, then multiplied by weeks. The
     semester rate replaces peak/off-peak entirely once it applies. */
  function costing() {
    var s = grid.summary();
    var w = weeks(), term = useTerm();
    var perWeek = 0;
    s.blocks.forEach(function (b) {
      perWeek += term ? HALLS[b.hall].price.term * b.hours : b.price;
    });
    return {
      blocks: s.blocks,
      hoursWeek: s.hours,
      hoursTotal: s.hours * w,
      weeks: w,
      term: term,
      perWeek: perWeek,
      total: perWeek * w
    };
  }

  function paint() {
    var c = costing();

    if (!c.blocks.length) {
      lines.innerHTML = '<p class="summary__empty">Zatím jste nevybrali žádné hodiny. ' +
                        'Klikněte na volná pole v <a class="tlink" href="#hodiny">rozvrhu</a>.</p>';
      totals.hidden = true;
      return;
    }

    lines.innerHTML = c.blocks.map(function (b) {
      var price = c.term ? HALLS[b.hall].price.term * b.hours : b.price;
      var tariff;
      if (c.term) {
        tariff = "<b>semestrální</b> " + HALLS[b.hall].price.term + " Kč/h";
      } else if (b.peakHours && b.offHours) {
        // straddles 16:00 — name both tariffs instead of averaging them
        tariff = b.offHours + " h mimo špičku + " + b.peakHours + " h špička";
      } else if (b.peakHours) {
        tariff = "špička " + HALLS[b.hall].price.peak + " Kč/h";
      } else {
        tariff = "mimo špičku " + HALLS[b.hall].price.off + " Kč/h";
      }
      return '<div class="line">' +
        '<div class="line__top">' +
          '<span class="line__d">' + b.dateLabel + '</span>' +
          '<span class="line__p">' + R.czk(price) + '</span>' +
        '</div>' +
        '<div class="line__m">' + R.hhmm(b.from) + "–" + R.hhmm(b.to) +
          " · " + b.hallName + " · " + b.hours + " h · " + tariff +
        '</div>' +
      '</div>';
    }).join("");

    totals.hidden = false;
    document.querySelector("[data-t-hours]").textContent =
      c.hoursTotal + " h" + (c.weeks > 1 ? " (" + c.hoursWeek + " h × " + c.weeks + ")" : "");
    document.querySelector("[data-t-rate]").textContent =
      c.term ? "semestrální" : "běžná";
    document.querySelector("[data-t-sum]").textContent = R.czk(c.total);
  }

  grid.on(paint);
  paint();

  document.querySelector("[data-clear]").addEventListener("click", function () {
    grid.clear();
    paint();
  });

  /* a stable-looking reference, derived from the booking rather than random */
  function reference(c, email) {
    var seed = email + "|" + c.blocks.map(function (b) { return b.date + b.from; }).join(",");
    var h = 0;
    for (var i = 0; i < seed.length; i++) { h = (h * 31 + seed.charCodeAt(i)) >>> 0; }
    var d = new Date();
    return "TK-" + String(d.getDate()).padStart(2, "0") +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(h % 10000).padStart(4, "0");
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var c = costing();
    errBox.textContent = "";

    if (!c.blocks.length) {
      errBox.textContent = "Vyberte nejdřív alespoň jednu hodinu v rozvrhu.";
      document.getElementById("hodiny").scrollIntoView({ block: "start" });
      return;
    }
    if (!form.reportValidity()) return;

    var f = new FormData(form);
    var halls = c.blocks.map(function (b) { return b.hallName; })
                        .filter(function (v, i, a) { return a.indexOf(v) === i; });

    document.querySelector("[data-r-ref]").textContent = reference(c, String(f.get("email")));
    document.querySelector("[data-r-hall]").textContent = halls.join(" + ");
    document.querySelector("[data-r-when]").innerHTML = c.blocks.map(function (b) {
      return b.dateLabel + ", " + R.hhmm(b.from) + "–" + R.hhmm(b.to);
    }).join("<br>");
    document.querySelector("[data-r-repeat]").textContent =
      c.weeks > 1 ? c.weeks + "× týdně, stejný čas" : "jednorázově";
    document.querySelector("[data-r-hours]").textContent =
      c.hoursTotal + " h" + (c.term ? " · semestrální sazba" : "");
    document.querySelector("[data-r-teacher]").textContent = f.get("teacher") || "—";
    document.querySelector("[data-r-purpose]").textContent = f.get("purpose") || "—";
    document.querySelector("[data-r-record]").textContent =
      f.get("record") ? "ano — kamery se spustí s rezervací" : "ne";
    document.querySelector("[data-r-sum]").textContent = R.czk(c.total);

    stageForm.hidden = true;
    stageDone.hidden = false;
    stageDone.scrollIntoView({ block: "start" });
  });

  document.querySelector("[data-again]").addEventListener("click", function () {
    stageDone.hidden = true;
    stageForm.hidden = false;
    form.reset();
    repeat.dataset.on = "false";
    grid.clear();
    paint();
    document.getElementById("hodiny").scrollIntoView({ block: "start" });
  });
})();
