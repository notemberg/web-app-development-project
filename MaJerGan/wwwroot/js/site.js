document.addEventListener("DOMContentLoaded", function () {

  const addEventButton = document.querySelector(".add-event");

  addEventButton.addEventListener("click", function () {
    window.location.href = "/Create";
  });
});
