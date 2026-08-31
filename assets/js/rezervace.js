/* Rezervace - the schedule is live; the form below it shows what booking asks
   for without pretending to submit anything. Nothing here talks to a server. */
(function () {
  var R = window.Rozvrh;
  var root = document.querySelector("[data-rozvrh]");
  if (!R || !root) return;

  var grid = R.create(root, { hall: "oba" });

  /* The picker chooses which halls the calendar draws, not which one you are
     booking - a cell carries its own hall, so "Oba sály" is two columns. */
  document.querySelectorAll('input[name="hall"]').forEach(function (el) {
    el.addEventListener("change", function () { grid.setHall(el.value); });
  });

  /* The ledger already totals the selection in its own footer, but by the time
     you are filling in the form that total has scrolled away - so mirror it
     next to the button that commits to it. */
  var hoursEl = document.querySelector("[data-price-hours]");
  var sumEl = document.querySelector("[data-price-sum]");
  if (hoursEl && sumEl) {
    grid.on(function (s) {
      hoursEl.textContent = s.hours + " h";
      sumEl.textContent = czk(s.total);
    });
  }

  function czk(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Kč";
  }

  /* the hero finder may already have asked what the booking is for */
  var form = document.getElementById("bookform");
  if (form) {
    var sel = form.querySelector('select[name="purpose"]'), saved;
    try { saved = window.localStorage.getItem("takt.purpose"); } catch (e) { saved = null; }
    if (sel && saved) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === saved) { sel.selectedIndex = i; break; }
      }
    }
    form.addEventListener("submit", function (ev) { ev.preventDefault(); });
  }
})();
