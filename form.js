/* Inquiry forms. There is no server: submitting opens the visitor's email app with the answers filled in,
   addressed to the address in the form's data-mailto attribute. Without JavaScript the form falls back to
   a plain mailto action. */
(function () {
  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (form.reportValidity && !form.reportValidity()) return;
      var lines = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === "submit" || !el.value.trim()) return;
        var label = el.getAttribute("data-label") || el.name;
        lines.push(label + ":\n" + el.value.trim());
      });
      var href = "mailto:" + form.getAttribute("data-mailto") +
        "?subject=" + encodeURIComponent(form.getAttribute("data-subject") || "FeatureGraph inquiry") +
        "&body=" + encodeURIComponent(lines.join("\n\n"));
      var link = document.createElement("a");
      link.href = href;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      var status = form.parentNode.querySelector(".form-status");
      if (status) {
        status.textContent = "Your email app should open with your message ready to send. If nothing opens, your browser may not have an email app set up.";
      }
    });
  });
})();
