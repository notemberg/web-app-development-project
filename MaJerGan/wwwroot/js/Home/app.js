// ✅ ตรวจสอบว่าเว็บใช้ HTTP หรือ HTTPS
const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";

// ✅ ใช้ hostname และ port ของเว็บอัตโนมัติ
const socketUrl = `${protocol}${window.location.host}/ws`;

const socket = new WebSocket(socketUrl); // ✅ ใช้ URL อัตโนมัติ

socket.onopen = () => {
    console.log("✅ WebSocket Connected");
};

socket.onmessage = (event) => {
    console.log("📩 Message from server:", event.data);
    
    if (event.data === "New Event Added!" || event.data === "Event Joined!" || event.data === "Event Deleted!") {
        fetchEvents(); // ✅ โหลดข้อมูลใหม่เมื่อมีอีเวนต์เปลี่ยนแปลง
    }
};

socket.onerror = (error) => {
    console.error("❌ WebSocket Error:", error);
};

socket.onclose = () => {
    console.log("❌ WebSocket Disconnected");
};

// ✅ 2️⃣ ฟังก์ชันโหลดข้อมูลอีเวนต์ (จาก API)
async function fetchEvents() {
    try {
        const response = await fetch('/Event/GetRecentEvents'); // เรียก API
        const events = await response.json(); // แปลงข้อมูลเป็น JSON
        updateUI(events); // อัปเดต UI
    } catch (error) {
        console.error("❌ Error fetching events:", error);
    }
}

// ✅ 3️⃣ ฟังก์ชันอัปเดต UI
function updateUI(events) {
    const recentContent = document.querySelector(".recent-content");
    recentContent.innerHTML = ""; // ล้างข้อมูลเก่า

    if (!events || events.length === 0) {
        recentContent.innerHTML = "<p style='text-align:center; color:gray;'>ไม่มีอีเวนต์ล่าสุด</p>";
        return;
    }

    events.forEach(event => {
        const eventCard = document.createElement("div");
        eventCard.classList.add("recent-event-card");
        eventCard.dataset.eventId = event.id;

        // ✅ แปลงแท็ก และจำกัดการแสดงผล
        let tagsArray = (event.tags || "").split(",");
        let limitedTags = tagsArray.slice(0, 3);
        let tagButtons = limitedTags
            .map(tag => `<button class="tag-button">${tag.trim()}</button>`)
            .join(" ");

        if (tagsArray.length > 3) {
            tagButtons += `<span class="more-tags"> +${tagsArray.length - 3} more</span>`;
        }

        // ✅ จำกัดความยาวของชื่อสถานที่
        let locationDisplay = event.location.length > 20 ? event.location.substring(0, 20) + "..." : event.location;

        // ✅ แปลงเวลาให้เป็นข้อความที่อ่านง่าย
        const formattedTime = timeAgo(new Date(event.createdAt));
        const formattedEventTime = formatEventTime(event.eventTime);

        // ✅ ใส่ข้อมูลลง HTML
        eventCard.innerHTML = `
            <span class="event-time">${formattedTime}</span>
            <div class="recent-event-content">
                <div class="event-header">
                    <p class="event-title">${event.title} <span class="Time"> ${formattedEventTime}</span></p>
                </div>
                <div class="event-body">
                    <div class="creator">Host By: <span class="creator-name">${event.creator}</span></div>
                    <div class="participants"><i class="fa-solid fa-user"></i> ${event.currentParticipants} / ${event.maxParticipants} @<span class="location">${locationDisplay}</span></div>
                    <div class="tags-container">Tags:${tagButtons}</div>
                </div>
            </div>
        `;
        recentContent.appendChild(eventCard);
    });

    // ✅ เพิ่ม Event Listener ให้คลิกแล้วเปิดหน้า Details
    document.querySelectorAll(".recent-event-card").forEach(card => {
        card.addEventListener("click", function (e) {
            if (!e.target.classList.contains("tag-button")) {
                window.location.href = `/Event/Details/${this.dataset.eventId}`;
            }
        });
    });
}

// ✅ 4️⃣ ตั้งให้โหลดข้อมูลทุก 30 วินาที (สำรองกรณี WebSocket ใช้งานไม่ได้)
setInterval(fetchEvents, 30000);

// ✅ 5️⃣ โหลดข้อมูลครั้งแรกเมื่อหน้าเว็บเปิดขึ้น
fetchEvents();

// ✅ 6️⃣ ฟังก์ชันแปลงเวลาที่สร้างอีเวนต์เป็น "x นาทีที่แล้ว"
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
}

// ✅ 7️⃣ ฟังก์ชันแปลง `eventTime` ให้อยู่ในรูปแบบ 28/02/25 at 3:30 PM
function formatEventTime(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} at ${hours}:${minutes} ${ampm}`;
}
