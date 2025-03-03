
async function fetchEventDetails(eventId) {
    try {
        const response = await fetch(`/Event/Details/s${eventId}`);
        if (!response.ok) throw new Error("Event not found");

        const event = await response.json();

        // Convert eventTime and expiryDate to Date objects
        const expiryDate = new Date(event.expiryDate);
        const now = new Date();

        // Calculate time remaining until the event starts
        const timeUntilExpiry = expiryDate - now;

        // Convert milliseconds to a readable format
        function formatTime(ms) {
            if (ms <= 0) return "Expired";
            const days = Math.floor(ms / (1000 * 60 * 60 * 24));
            const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            return `${days}d ${hours}h ${minutes}m`;
        }
        console.log("Time Until Expiry:", formatTime(timeUntilExpiry));
        // Display data on the page (example)
        document.getElementById("timeUntilExpiry").textContent = formatTime(timeUntilExpiry);
    } catch (error) {
        console.error("Error fetching event:", error.message);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const eventId = document.getElementById("eventId").dataset.id;
    fetchEventDetails(eventId)
    setInterval(() => fetchEventDetails(eventId), 5000);

    console.log("Event ID:", eventId);

  });

