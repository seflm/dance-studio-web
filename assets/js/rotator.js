/* ==========================================================================
   Headline word rotator - "Prostory pro [tanec / salsu / swing …]"
   This is a dance studio first, so the words are dances and the things that
   happen on a dance floor. Non-dance uses of the hall live in lists and in
   the booking dropdown, never in the headline.

   Only styles the floor can honestly host: the parquet sits on a solid base
   with no spring, so ballet, contemporary, hip hop and anything else built on
   jumps and floorwork stays off this list - and off the rest of the site.

   "tanec" is always shown first - it is the one word that has to land - and
   the rest are shuffled per page load, so a returning visitor sees a
   different handful. Words are kept short on purpose: the container animates
   its width to fit each one, and a long word makes the whole line breathe
   in and out.
   ========================================================================== */
(function (global) {
  "use strict";

  var WORDS = ["tanec", "salsu", "bachatu", "swing", "lindy hop", "kizombu",
               "zouk", "tango", "kurzy", "workshopy"];
  var HOLD = 1600;   // how long each word stays
  var FADE = 190;    // must match the CSS transition

  /* Fisher–Yates over everything but the first word, which stays put. */
  function order(words) {
    var rest = words.slice(1);
    for (var i = rest.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = rest[i]; rest[i] = rest[j]; rest[j] = t;
    }
    return [words[0]].concat(rest);
  }

  function init(el, words) {
    words = order(words || WORDS);
    var word = el.querySelector("[data-rot-word]");
    if (!word) return;

    // An off-screen twin, used only to measure the next word. It lives on
    // <body>, not inside the heading - otherwise its text would show up in the
    // heading's textContent and in anything that reads the page as a string.
    var ghost = document.createElement("span");
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;left:-9999px;top:0";
    document.body.appendChild(ghost);

    function syncGhost() {
      var cs = global.getComputedStyle(word);
      ghost.style.font = cs.font;
      ghost.style.fontFamily = cs.fontFamily;
      ghost.style.fontSize = cs.fontSize;
      ghost.style.fontWeight = cs.fontWeight;
      ghost.style.fontStyle = cs.fontStyle;
      ghost.style.letterSpacing = cs.letterSpacing;
      ghost.style.textTransform = cs.textTransform;
    }

    function widthOf(text) {
      syncGhost();
      ghost.textContent = text;
      return ghost.getBoundingClientRect().width;
    }

    // hold the starting width so the first transition has something to leave
    el.style.width = widthOf(words[0]) + "px";
    word.textContent = words[0];

    if (global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (words.length < 2) return;

    var i = 0;
    var timer = null;

    function tick() {
      i = (i + 1) % words.length;
      var next = words[i];
      word.dataset.out = "true";                 // fade the current word away
      el.style.width = widthOf(next) + "px";     // and grow toward the next
      global.setTimeout(function () {
        word.textContent = next;
        word.dataset.out = "false";
      }, FADE);
    }

    function start() { if (!timer) timer = global.setInterval(tick, HOLD + FADE); }
    function stop() { global.clearInterval(timer); timer = null; }

    // no point animating a headline nobody is looking at
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();

    // a long word can wrap differently after a resize
    var rt = null;
    global.addEventListener("resize", function () {
      global.clearTimeout(rt);
      rt = global.setTimeout(function () { el.style.width = widthOf(words[i]) + "px"; }, 150);
    });
  }

  global.Rotator = {
    WORDS: WORDS,
    boot: function (selector, words) {
      var nodes = document.querySelectorAll(selector || "[data-rot]");
      for (var n = 0; n < nodes.length; n++) init(nodes[n], words);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { global.Rotator.boot(); });
  } else {
    global.Rotator.boot();
  }
})(window);
