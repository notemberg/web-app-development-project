document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("input").forEach((input) => {
      input.setAttribute("autocomplete", "off");
    });
  });