document.addEventListener("DOMContentLoaded", function () {
    const eventId = document.getElementById("eventId").dataset.id;
    fetchEventDetails(eventId);
    loadParticipants(eventId);

    // Refresh both event details and participants every 5 seconds
    setInterval(() => {
        fetchEventDetails(eventId);
        loadParticipants(eventId);
    }, 5000);

    console.log("✅ JavaScript is running..."); // Debugging check
    const joinContainer = document.getElementById("joinContainerss");

    // ✅ Check if `joinContainer` exists before adding the button
    if (!joinContainer) {
        console.error("❌ Error: joinContainer not found!");
        return;
    }

    // ✅ Create Join Button
    const button = document.createElement("button");
    button.classList.add("join-btn");
    button.innerHTML = "🚀 เข้าร่วมกิจกรรม";
    button.type = "button"; // Prevents page reload

    // ✅ Append Button to Container
    joinContainer.appendChild(button);
    console.log("✅ Button added successfully!"); // Debugging check

    // ✅ AJAX Join Request with `alert()`
    button.addEventListener("click", function () {
        fetch("/Event/Join", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `eventId=${eventId}`
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Server Response:", data);
            alert(data.success ? "✅ เข้าร่วมแล้ว!" : "❌ ไม่สามารถเข้าร่วมกิจกรรมได้: " + data.message);
        })
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const commentsContainer = document.getElementById("commentsContainer");
    const commentInput = document.getElementById("commentContent");
    const postButton = document.getElementById("postCommentBtn");
    const eventElement = document.getElementById("eventId");
    const eventId = eventElement ? eventElement.getAttribute("data-id") : null;


    // ✅ Move participant section based on screen size
    function moveParticipant() {
        const participantSection = document.getElementById("participantSection");
        const infoDetail = document.querySelector(".information-detail");
        const content = document.querySelector(".content");
    
        if (!participantSection || !infoDetail) {
            console.error("❌ participantSection or infoDetail not found!");
            return;
        }
    
        if (window.innerWidth <= 767) {
            if (participantSection.parentNode !== infoDetail.parentNode) {
                console.log("✅ Moved participant BELOW information-detail.");
                infoDetail.after(participantSection); // ✅ Move only if not already moved
            }
        } else {
            const content = document.querySelector(".content");
            if (participantSection.parentNode !== content) {
                console.log("✅ Moved participant BACK to original position.");
                content.appendChild(participantSection); // ✅ Move back to original position
            }
        }
    }

    // ✅ Load comments
    function loadComments() {

        fetch(`/Event/GetComments?eventId=${eventId}`)
        .then(response => response.json())
        .then(comments => {
            commentsContainer.innerHTML = comments.length === 0 
                ? "<p>ยังไม่มีความคิดเห็น</p>" 
                : comments.map(comment => `
                    <div class="comment-item">
                        <div class="comment-box">
                            <img src="${comment.profileImg}" class="profile-image" alt="${comment.username}">
                            <div class="comment-content">
                                <p><strong>${comment.username}</strong> - 
                                <span class="comment-time">${comment.createdAt}</span></p>
                                <p>${comment.content}</p>
                            </div>
                        </div>
                    </div>
                `).join('');
        })
        .catch(error => console.error("❌ Error loading comments:", error));
    }

    // ✅ Post comment
    postButton.addEventListener("click", function () {
        const content = commentInput.value.trim();
        if (!content) {
            alert("❌ กรุณากรอกความคิดเห็นก่อนส่ง");
            return;
        }

        fetch("/Event/PostComment", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `eventId=${eventId}&content=${encodeURIComponent(content)}`
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.success) {
                commentInput.value = "";
                loadComments();
            }
        })
        .catch(error => console.error("❌ Error posting comment:", error));
    });

    // ✅ Run functions on page load and window resize
    loadComments();
    moveParticipant();
    window.addEventListener("resize", moveParticipant);

    const observer = new MutationObserver(moveParticipant);
    observer.observe(document.body, { childList: true, subtree: true });
});


async function fetchEventDetails(eventId) {
    try {
        const response = await fetch(`/Event/Details/s${eventId}`);
        if (!response.ok) throw new Error("Event not found");

        const event = await response.json();

        // Convert eventTime and expiryDate to Date objects
        const expiryDate = new Date(event.expiryDate);
        const evevntDate = new Date(event.eventTime);
        const now = new Date();

        // Calculate time remaining until the event starts
        const timeUntilExpiry = expiryDate - now;
        const timeUntilEvent = evevntDate - now

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
        document.getElementById("timeUntilEvent").textContent = formatTime(timeUntilEvent);
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
        const userElement = document.getElementById("currentUser");
        const currentUserId = userElement ? userElement.getAttribute("data-user-id") : null;

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

            if (participant.status === "Pending" && (String(currentUserId) === String(participant.creator))) {
                console.log("insideeeeeeeeeeeeeeeeee")
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
            participantElement.remove(); 
        }

    } catch (error) {
        console.error(`❌ Error while ${action}ing participant:`, error);
    }
}
