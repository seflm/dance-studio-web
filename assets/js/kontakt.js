/* The contact form shows what we ask for; it does not take submissions yet.
   The submit button is disabled in the markup, but a form can still be sent
   by pressing Enter in a text field, which would reload the page with the
   answers in the query string. This stops that. */
(function () {
  var form = document.getElementById("contactform");
  if (!form) return;
  form.addEventListener("submit", function (ev) { ev.preventDefault(); });
})();
