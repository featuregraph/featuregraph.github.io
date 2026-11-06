/* Inquiry forms. Submissions are posted to the inquiry service (see ENDPOINT). If that service cannot be
   reached, the form falls back to opening the visitor's email app with the answers filled in, addressed to the
   form's data-mailto address. Without JavaScript the form uses a plain mailto action. */
(function () {
  var ENDPOINT = "https://api.featuregraph.ai/inquiries";

  function fieldsOf(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && el.type !== "submit") data[el.name] = el.value.trim();
    });
    return data;
  }

  function openMailto(form) {
    var lines = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.name === "website" || el.type === "submit" || !el.value.trim()) return;
      lines.push((el.getAttribute("data-label") || el.name) + ":\n" + el.value.trim());
    });
    var href = "mailto:" + form.getAttribute("data-mailto") +
      "?subject=" + encodeURIComponent(form.getAttribute("data-subject") || "FeatureGraph inquiry") +
      "&body=" + encodeURIComponent(lines.join("\n\n"));
    var link = document.createElement("a");
    link.href = href;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document.querySelectorAll("form[data-kind]").forEach(function (form) {
    var status = form.parentNode.querySelector(".form-status");
    var button = form.querySelector("button[type=submit]");
    function say(text) { if (status) status.textContent = text; }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (form.reportValidity && !form.reportValidity()) return;
      var body = fieldsOf(form);
      body.kind = form.getAttribute("data-kind");
      button.disabled = true;
      say("Sending…");
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function (response) {
        if (response.ok) {
          form.reset();
          say("Thank you. Your message has been sent.");
        } else if (response.status === 400) {
          return response.json().then(function (data) {
            say("Please check the form: " + (data.error || "something is missing") );
          });
        } else {
          throw new Error("status " + response.status);
        }
      }).catch(function () {
        openMailto(form);
        say("We could not send this directly, so your email app should open with your message ready to send.");
      }).then(function () {
        button.disabled = false;
      });
    });
  });
})();
