/* ==========================================================================
   Rozvrh — availability ledger for Taneční studio 29
   The product is time in a room, so the schedule is the interface, not a
   widget bolted onto one. The homepage grid and the booking page share this
   engine and the same held-hours store, so a selection made on the homepage
   is already there when you arrive at Rezervace.

   MOCK-UP: occupancy is generated deterministically from the date so the grid
   looks alive and stays stable between reloads. There is no server.
   ========================================================================== */
(function (global) {
  "use strict";

  /* --- studio configuration ----------------------------------------------
     Every number the booking flow calculates with lives here. NOTE: the price
     tables printed on the pages are plain HTML so they still read with
     JavaScript off, which means the rates appear in two places. If you change
     a rate here, also change it in:
       · index.html      — .hall__pr on both cards in #saly (the full table
                           now lives only on rezervace.html)
       · prostory.html   — .hall__pr under each room (#velky, #maly, #oba)
       · rezervace.html  — table.t in #cenik, and the "od … Kč / h" lines
                           in .picker
       · partneri.html   — the "640 Kč/h místo 790 Kč/h" line in the terms
       · index.html      — the JSON-LD "makesOffer" block in <head>
     ---------------------------------------------------------------------- */
  var STUDIO = {
    openFrom: 7,          // first bookable hour
    openTo: 22,           // last hour ends here
    halls: {
      velky: { id: "velky", name: "Velký sál", shortName: "Velký", area: "168 m²", cap: 50,
               price: { off: 590, peak: 790, term: 640 } },
      maly:  { id: "maly",  name: "Malý sál",  shortName: "Malý",  area: "20 m²",  cap: 4,
               price: { off: 290, peak: 390, term: 320 } },
      oba:   { id: "oba",   name: "Oba sály",  area: "188 m²", cap: 54,
               price: { off: 820, peak: 1090, term: 890 } }
    },
    // the evening tariff — weekday evenings, when every dance school wants
    // the room. Called "Večerní tarif" on the pages; "peak" only in here.
    peakFrom: 16,
    minHours: 1,
    maxWeeksAhead: 12
  };

  var DAYS   = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
  var MONTHS = ["ledna", "února", "března", "dubna", "května", "června",
                "července", "srpna", "září", "října", "listopadu", "prosince"];
  // What the room is being used for. Deliberately generic: the mock-up never
  // puts a real school's name in a slot it has not actually booked.
  var USES = {
    // weekends belong to workshops and intensives, which run for hours
    weekend: ["Workshop", "Workshop", "Intenziv", "Zkouška", "Focení"],
    // weekday evenings are the term-course peak every school competes for
    evening: ["Kurz", "Kurz", "Kurz", "Lekce", "Trénink"],
    // weekday daytime is rehearsals and one-to-ones
    day:     ["Trénink", "Zkouška", "Lekce", "Focení"]
  };

  var STORE_KEY = "ts29.hold.v1";

  /* --- dates ------------------------------------------------------------- */
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

  function iso(d) {
    return d.getFullYear() + "-" +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }

  function spanLabel(first, count) {
    var last = addDays(first, (count || 7) - 1);
    if (first.getMonth() === last.getMonth()) {
      return first.getDate() + ".–" + last.getDate() + ". " +
             MONTHS[first.getMonth()] + " " + last.getFullYear();
    }
    return first.getDate() + ". " + MONTHS[first.getMonth()] + " – " +
           last.getDate() + ". " + MONTHS[last.getMonth()] + " " + last.getFullYear();
  }

  function longDate(d) {
    return DAYS[(d.getDay() + 6) % 7] + " " + d.getDate() + ". " +
           MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  /* --- deterministic pseudo-occupancy ------------------------------------ */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967296;         // 0 .. 1
  }

  /* Build one day's occupancy as contiguous blocks — a school books 90 or 120
     minutes in a row, never scattered single hours. */
  function dayOccupancy(hallId, date) {
    var key = hallId + "|" + iso(date);
    var wd = (date.getDay() + 6) % 7;
    var weekend = wd >= 5;
    var out = {};
    var h = STUDIO.openFrom;
    var taken = 0;
    // a real day holds two long weekend workshops, or three weekday bookings —
    // not a wall of hatching
    var maxBlocks = weekend ? 2 : 3;
    var lastUse = null;

    while (h < STUDIO.openTo && taken < maxBlocks) {
      var evening = h >= STUDIO.peakFrom;
      var wknDay = weekend && h >= 10 && h < 19;

      // how full the room tends to be at this hour
      var pressure = weekend ? (wknDay ? 0.34 : 0.10)
                             : (evening ? 0.62 : 0.16);
      if (hallId === "maly") pressure *= 0.60;

      var r = hash(key + "|" + h);
      if (r < pressure) {
        var lenSeed = hash(key + "|len|" + h);
        var len = wknDay ? (lenSeed < 0.5 ? 3 : 4)
                : evening ? (lenSeed < 0.6 ? 2 : 3)
                          : (lenSeed < 0.55 ? 2 : 1);
        var pool = wknDay ? USES.weekend : evening ? USES.evening : USES.day;
        var idx = Math.floor(hash(key + "|use|" + h) * pool.length);
        // never label two bookings in a row the same thing
        if (pool[idx] === lastUse) idx = (idx + 1) % pool.length;
        var use = pool[idx];
        lastUse = use;

        for (var k = 0; k < len && h + k < STUDIO.openTo; k++) {
          out[h + k] = use;
        }
        taken += 1;
        h += len + 1;                      // leave a gap between bookings
      } else {
        h += 1;
      }
    }
    return out;
  }

  /* --- tariff ------------------------------------------------------------ */
  function isPeak(date, hour) {
    var wd = (date.getDay() + 6) % 7;
    return wd < 5 && hour >= STUDIO.peakFrom;
  }

  function hourPrice(hallId, date, hour) {
    var p = STUDIO.halls[hallId].price;
    return isPeak(date, hour) ? p.peak : p.off;
  }

  function czk(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Kč";
  }

  /* --- held-hours store (survives page moves; mock-up only) -------------- */
  function readHold() {
    try {
      var raw = global.localStorage.getItem(STORE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function writeHold(list) {
    try { global.localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
    catch (e) { /* private mode — the selection just does not persist */ }
  }

  function holdKey(h) { return h.hall + "|" + h.date + "|" + h.hour; }

  /* --- the grid ---------------------------------------------------------- */
  function Rozvrh(root, opts) {
    this.root = root;
    this.opts = opts || {};
    this.hall = this.opts.hall || "velky";
    this.dayOffset = 0;
    this.days = dayCount();
    this.hold = readHold().filter(function (h) { return h.date >= iso(startOfDay(new Date())); });
    this.listeners = [];
    this.build();
    this.render();
  }

  Rozvrh.prototype.on = function (fn) { this.listeners.push(fn); return this; };

  Rozvrh.prototype.emit = function () {
    var s = this.summary();
    this.listeners.forEach(function (fn) { fn(s); });
  };

  Rozvrh.prototype.setHall = function (id) {
    if (!STUDIO.halls[id]) return;
    this.hall = id;
    this.render();
    this.emit();
  };

  Rozvrh.prototype.build = function () {
    this.root.innerHTML =
      '<div class="ledger__hd">' +
        '<span class="tag" data-r="title">Rozvrh</span>' +
        '<div class="ledger__nav">' +
          '<button type="button" data-r="prev" aria-label="Předchozí týden">‹</button>' +
          '<span class="ledger__wk" data-r="week" aria-live="polite"></span>' +
          '<button type="button" data-r="next" aria-label="Následující týden">›</button>' +
        '</div>' +
      '</div>' +
      '<div class="grid" data-r="grid" role="grid" aria-label="Volné hodiny"></div>' +
      '<div class="ledger__ft">' +
        '<ul class="legend">' +
          '<li><i class="swatch swatch--free"></i>Volno</li>' +
          '<li><i class="swatch swatch--taken"></i>Obsazeno</li>' +
          '<li><i class="swatch swatch--held"></i>Vaše hodiny</li>' +
        '</ul>' +
        '<div class="tally">' +
          '<span class="tag">Vybráno</span>' +
          '<span class="tally__n" data-r="hours">0 h</span>' +
          '<span class="tally__n tally__n--accent" data-r="sum">0 Kč</span>' +
        '</div>' +
      '</div>';

    this.el = {
      grid:  this.root.querySelector('[data-r="grid"]'),
      week:  this.root.querySelector('[data-r="week"]'),
      prev:  this.root.querySelector('[data-r="prev"]'),
      next:  this.root.querySelector('[data-r="next"]'),
      hours: this.root.querySelector('[data-r="hours"]'),
      sum:   this.root.querySelector('[data-r="sum"]'),
      title: this.root.querySelector('[data-r="title"]')
    };

    var self = this;
    var lastCount = dayCount();
    var t = null;
    global.addEventListener("resize", function () {
      global.clearTimeout(t);
      t = global.setTimeout(function () {
        if (dayCount() === lastCount) return;
        lastCount = dayCount();
        self.render();
      }, 140);
    });
    this.el.prev.addEventListener("click", function () { self.step(-1); });
    this.el.next.addEventListener("click", function () { self.step(1); });
    this.el.grid.addEventListener("click", function (ev) {
      var cell = ev.target.closest("[data-hour]");
      if (cell) self.toggle(cell);
    });
  };

  /* Seven columns need about 90 px each to keep the dates apart and the cells
     comfortably tappable. Below that the ledger shows fewer days rather than
     scrolling sideways or shrinking past legibility. */
  function dayCount() {
    var w = global.innerWidth || 1200;
    if (w >= 900) return 7;
    if (w >= 620) return 5;
    return 3;
  }

  Rozvrh.prototype.maxOffset = function () {
    return STUDIO.maxWeeksAhead * 7 - this.days;
  };

  Rozvrh.prototype.step = function (n) {
    var next = this.dayOffset + n * this.days;
    if (next < 0) next = 0;
    if (next > this.maxOffset()) next = this.maxOffset();
    if (next === this.dayOffset) return;
    this.dayOffset = next;
    this.render();
  };

  /* The grid shows a column per hall per day. "Oba sály" therefore means two
     columns rather than a third price band, so one calendar answers "is
     anything free on Thursday" without switching views. */
  Rozvrh.prototype.shown = function () {
    return this.hall === "oba" ? ["velky", "maly"] : [this.hall];
  };

  Rozvrh.prototype.render = function () {
    var now = new Date();
    this.days = dayCount();
    if (this.dayOffset > this.maxOffset()) this.dayOffset = Math.max(0, this.maxOffset());
    var n = this.days;
    var first = addDays(startOfDay(now), this.dayOffset);
    var todayIso = iso(now);
    var held = {};
    this.hold.forEach(function (h) { held[holdKey(h)] = true; });

    this.el.week.textContent = spanLabel(first, n);
    this.el.prev.disabled = this.dayOffset === 0;
    this.el.next.disabled = this.dayOffset >= this.maxOffset();
    var halls = this.shown();
    var hn = halls.length;
    this.el.grid.dataset.halls = String(hn);
    this.el.grid.style.gridTemplateColumns =
      "var(--grid-hr, 62px) repeat(" + (n * hn) + ", minmax(0, 1fr))";
    if (this.el.title) this.el.title.textContent = "Rozvrh";

    var days = [];
    for (var i = 0; i < n; i++) days.push(addDays(first, i));

    // occupancy is per hall per day, so it is a two-level lookup now
    var occ = days.map(function (d) {
      return halls.map(function (id) { return dayOccupancy(id, d); });
    });

    var html = '<div class="grid__corner"' + (hn > 1 ? ' style="grid-row: span 2"' : '') + '></div>';
    days.forEach(function (d) {
      var isToday = iso(d) === todayIso;
      html += '<div class="grid__day" role="columnheader" data-today="' + isToday + '"' +
              (hn > 1 ? ' style="grid-column: span ' + hn + '"' : '') + '>' +
              (isToday ? "Dnes" : DAYS[(d.getDay() + 6) % 7]) +
              '<b>' + d.getDate() + '.' + (d.getMonth() + 1) + '.</b></div>';
    });
    if (hn > 1) {
      days.forEach(function (d) {
        halls.forEach(function (id) {
          html += '<div class="grid__hall" data-today="' + (iso(d) === todayIso) + '">' +
                  STUDIO.halls[id].shortName + '</div>';
        });
      });
    }

    for (var h = STUDIO.openFrom; h < STUDIO.openTo; h++) {
      html += '<div class="grid__hr">' + String(h).padStart(2, "0") + ':00</div>';
      for (var c = 0; c < n; c++) {
        var d = days[c];
        var dIso = iso(d);
        var past = d < startOfDay(now) || (dIso === todayIso && h <= now.getHours());
        for (var q = 0; q < hn; q++) {
          var hallId = halls[q];
          var state, tag = "", use = occ[c][q][h];

          if (held[hallId + "|" + dIso + "|" + h]) { state = "held"; }
          else if (past)  { state = "past"; }
          else if (use)   { state = "taken"; tag = use; }
          else            { state = "free"; }

          var clickable = state === "free" || state === "held";
          html += '<' + (clickable ? "button" : "div") + ' class="cell"' +
                  ' data-state="' + state + '"' +
                  ' data-col="' + (c + 1) + '"' +
                  ' data-last="' + (c === n - 1 && q === hn - 1) + '"' +
                  ' data-edge="' + (q === hn - 1) + '"' +
                  (clickable ? ' type="button" data-hour="' + h + '" data-date="' + dIso +
                               '" data-hall="' + hallId + '"' : "") +
                  ' role="gridcell"' +
                  ' aria-label="' + STUDIO.halls[hallId].name + ", " + longDate(d) + ", " +
                    String(h).padStart(2, "0") + ":00 – " +
                    String(h + 1).padStart(2, "0") + ":00, " +
                    (state === "free" ? "volno, " + czk(hourPrice(hallId, d, h))
                     : state === "held" ? "vybráno"
                     : state === "taken" ? "obsazeno" : "nedostupné") + '">' +
                  (tag ? '<span class="cell__tag">' + tag + "</span>" : "") +
                  '</' + (clickable ? "button" : "div") + '>';
        }
      }
    }

    this.el.grid.innerHTML = html;
    this.tally();
  };

  Rozvrh.prototype.toggle = function (cell) {
    var date = cell.dataset.date;
    var hour = Number(cell.dataset.hour);
    var entry = { hall: cell.dataset.hall || this.hall, date: date, hour: hour };
    var key = holdKey(entry);
    var i = -1;
    this.hold.forEach(function (h, n) { if (holdKey(h) === key) i = n; });

    if (i > -1) {
      this.hold.splice(i, 1);
      cell.dataset.state = "free";
    } else {
      this.hold.push(entry);
      cell.dataset.state = "held";
    }
    writeHold(this.hold);
    this.tally();
    this.emit();
  };

  Rozvrh.prototype.clear = function () {
    this.hold = [];
    writeHold(this.hold);
    this.render();
    this.emit();
  };

  /* Group held hours into contiguous runs per day — the way a person reads
     their own booking ("Tuesday 19:00–21:00", not "19:00, 20:00"). */
  Rozvrh.prototype.summary = function () {
    var byDay = {};
    this.hold.forEach(function (h) {
      (byDay[h.hall + "|" + h.date] = byDay[h.hall + "|" + h.date] || []).push(h.hour);
    });

    var blocks = [];
    Object.keys(byDay).sort().forEach(function (k) {
      var parts = k.split("|");
      var hallId = parts[0], dIso = parts[1];
      var hours = byDay[k].sort(function (a, b) { return a - b; });
      var run = [hours[0]];
      for (var i = 1; i <= hours.length; i++) {
        if (hours[i] === hours[i - 1] + 1) { run.push(hours[i]); continue; }
        var d = new Date(dIso + "T00:00:00");
        var price = run.reduce(function (s, hh) { return s + hourPrice(hallId, d, hh); }, 0);
        // A block can straddle 16:00, so it can carry both tariffs. Report the
        // split rather than an averaged rate that matches no price on the list.
        var peakHours = run.filter(function (hh) { return isPeak(d, hh); }).length;
        blocks.push({
          hall: hallId,
          hallName: STUDIO.halls[hallId].name,
          date: dIso,
          dateLabel: longDate(d),
          from: run[0],
          to: run[run.length - 1] + 1,
          hours: run.length,
          peakHours: peakHours,
          offHours: run.length - peakHours,
          peak: peakHours > 0,
          price: price
        });
        if (hours[i] !== undefined) run = [hours[i]];
      }
    });

    blocks.sort(function (a, b) { return a.date.localeCompare(b.date) || a.from - b.from; });

    return {
      blocks: blocks,
      hours: blocks.reduce(function (s, b) { return s + b.hours; }, 0),
      total: blocks.reduce(function (s, b) { return s + b.price; }, 0)
    };
  };

  Rozvrh.prototype.tally = function () {
    var s = this.summary();
    this.el.hours.textContent = s.hours + " h";
    this.el.sum.textContent = czk(s.total);
  };

  /* The next free block from now on, looking several days ahead, so a page can
     always say when the hall IS free instead of when it is not. */
  function nextFreeBlock(hallId, daysAhead) {
    var now = new Date();
    for (var i = 0; i <= (daysAhead === undefined ? 7 : daysAhead); i++) {
      var d = addDays(startOfDay(now), i);
      var occ = dayOccupancy(hallId, d);
      var start = i === 0 ? Math.max(STUDIO.openFrom, now.getHours() + 1) : STUDIO.openFrom;
      var from = null, to = null;
      for (var h = start; h < STUDIO.openTo; h++) {
        if (occ[h]) { if (from !== null) break; continue; }
        if (from === null) from = h;
        to = h + 1;
      }
      if (from !== null) {
        return {
          date: d, iso: iso(d), from: from, to: to,
          when: i === 0 ? "dnes" : i === 1 ? "zítra"
                : DAYS[(d.getDay() + 6) % 7] + " " + d.getDate() + ". " + (d.getMonth() + 1) + "."
        };
      }
    }
    return null;
  }

  /* --- next free block today, for the hero's status chip ----------------- */
  function nextFreeToday(hallId) {
    var now = new Date();
    var occ = dayOccupancy(hallId, now);
    var from = null, to = null;
    for (var h = Math.max(STUDIO.openFrom, now.getHours() + 1); h < STUDIO.openTo; h++) {
      if (occ[h]) { if (from !== null) break; continue; }
      if (from === null) from = h;
      to = h + 1;
    }
    return from === null ? null : { from: from, to: to };
  }

  /* --- how many hours are still free on a given day ---------------------- */
  function freeHoursOn(hallId, date) {
    var occ = dayOccupancy(hallId, date);
    var now = new Date();
    var today = iso(date) === iso(now);
    var n = 0;
    for (var h = STUDIO.openFrom; h < STUDIO.openTo; h++) {
      if (occ[h]) continue;
      if (today && h <= now.getHours()) continue;   // already gone
      n++;
    }
    return n;
  }

  /* The next seven days with their free-hour counts — enough for a design that
     wants to show availability without drawing the whole ledger. */
  function outlook(hallId, days) {
    var out = [];
    var start = startOfDay(new Date());
    for (var i = 0; i < (days || 7); i++) {
      var d = addDays(start, i);
      out.push({
        date: d,
        iso: iso(d),
        day: DAYS[(d.getDay() + 6) % 7],
        dayNum: d.getDate() + "." + (d.getMonth() + 1) + ".",
        today: i === 0,
        free: freeHoursOn(hallId, d),
        capacity: STUDIO.openTo - STUDIO.openFrom
      });
    }
    return out;
  }

  global.Rozvrh = {
    STUDIO: STUDIO,
    DAYS: DAYS,
    create: function (root, opts) { return new Rozvrh(root, opts); },
    nextFreeToday: nextFreeToday,
    nextFreeBlock: nextFreeBlock,
    freeHoursOn: freeHoursOn,
    outlook: outlook,
    occupancyOn: dayOccupancy,
    czk: czk,
    longDate: longDate,
    readHold: readHold,
    hourPrice: hourPrice,
    isPeak: isPeak,
    addDays: addDays,
    iso: iso,
    hhmm: function (h) { return String(h).padStart(2, "0") + ":00"; }
  };
})(window);
