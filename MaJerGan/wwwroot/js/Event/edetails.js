
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
            // If participant is pending, add Approve and Reject buttons
            if (participant.status === "Pending") {
                const approveButton = document.createElement("button");
                approveButton.innerHTML = "✅";
                approveButton.classList.add("btn", "btn-success", "btn-sm");
                approveButton.onclick = () => updateParticipantStatus(participant.userid, eventId, "Approve", participantElement);

                const rejectButton = document.createElement("button");
                rejectButton.innerHTML = "❌";
                rejectButton.classList.add("btn", "btn-danger", "btn-sm");
                rejectButton.onclick = () => updateParticipantStatus(participant.userid, eventId, "Reject", participantElement);

                participantElement.appendChild(approveButton);
                participantElement.appendChild(rejectButton);
            }

            if (participant.status === "Approved") {
                approvedContainer.appendChild(participantElement);
            } else if (participant.status === "Pending") {
                pendingContainer.appendChild(participantElement);
            }
        });
    } catch (error) {
        console.error("❌ Error loading participants:", error);
    }
}

async function updateParticipantStatus(userId, eventId, action, participantElement) {
    try {
        const response = await fetch(`/Event/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `eventId=${eventId}&userId=${userId}`
            
        });

        if (!response.ok) throw new Error(`${action} request failed`);

        console.log(`✅ Successfully ${action}d participant`);
        
        // Remove from pending list if rejected, move to approved list if approved
        if (action === "Approve") {
            participantElement.classList.remove("waiting");
            participantElement.style.border = "2px solid #FFB6CF"; // Solid border for approved
            document.getElementById("approvedParticipants").appendChild(participantElement);
        } else {
            participantElement.remove(); // Remove rejected participant
        }

    } catch (error) {
        console.error(`❌ Error while ${action}ing participant:`, error);
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