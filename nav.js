/* Mobile menu: collapses the header links behind a button on narrow screens.
   Without JavaScript the links simply stay visible. */
document.documentElement.classList.add("js");
document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector("header");
  var button = header && header.querySelector(".menu-toggle");
  var nav = header && header.querySelector("nav");
  if (!button || !nav) return;
  function setOpen(open) {
    header.classList.toggle("nav-open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
  }
  button.addEventListener("click", function () {
    setOpen(!header.classList.contains("nav-open"));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
  window.matchMedia("(min-width: 801px)").addEventListener("change", function (e) {
    if (e.matches) setOpen(false);
  });
});
