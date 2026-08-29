/* Contact form — validates, then renders the confirmation locally. No network. */
(function () {
  var form = document.getElementById("contactform");
  var sent = document.querySelector("[data-sent]");
  if (!form || !sent) return;

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!form.reportValidity()) return;
    document.querySelector("[data-sent-mail]").textContent =
      new FormData(form).get("email");
    form.hidden = true;
    sent.hidden = false;
    sent.scrollIntoView({ block: "center" });
  });

  document.querySelector("[data-sent-again]").addEventListener("click", function () {
    form.reset();
    sent.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ block: "center" });
  });
})();
