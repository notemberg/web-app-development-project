
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

async function loadParticipants(eventId) {
    try {
        const response = await fetch(`/Event/GetParticipants?eventId=${eventId}`);
        if (!response.ok) throw new Error("Failed to fetch participants");

        const participants = await response.json();
        const approvedContainer = document.getElementById("approvedParticipants");
        const pendingContainer = document.getElementById("pendingParticipants");

        approvedContainer.innerHTML = "";
        pendingContainer.innerHTML = "";

        if (participants.length === 0) {
            approvedContainer.innerHTML = "<p>ไม่มีผู้เข้าร่วม</p>";
            return;
        }

        participants.forEach(participant => {
            console.log("🔹 Adding Participant:", participant.username, participant.status); // Debugging log
            const participantElement = document.createElement("div");
            participantElement.classList.add("participant-box");

            
            if (participant.status === "Pending") {
                participantElement.classList.add("waiting");
                participantElement.style.border = "2px dashed #FFB6CF"; // Add dashed border for pending
            }
            
            participantElement.innerHTML = `
                <img src="${participant.profileImg}" class="profile-images" alt="${participant.username}">
                <span class="participant-name">${participant.username}</span>
            `;

            if (participant.status === "Approved") {
                approvedContainer.appendChild(participantElement);
            } else {
                pendingContainer.appendChild(participantElement);
            }
        });
    } catch (error) {
        console.error("❌ Error loading participants:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const eventId = document.getElementById("eventId").dataset.id;
    fetchEventDetails(eventId);
    loadParticipants(eventId);

    // Refresh both event details and participants every 5 seconds
    setInterval(() => {
        fetchEventDetails(eventId);
        loadParticipants(eventId);
    }, 5000);
});