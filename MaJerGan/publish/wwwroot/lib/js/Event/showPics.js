document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("event-date");

    // Prevent selecting past dates
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
});