document.addEventListener("DOMContentLoaded", function () {
  const addEventButton = document.querySelector(".add-event");

  addEventButton.addEventListener("click", function () {
    window.location.href = "/event/Create";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("/Event/GetHotEvents")
    .then((response) => response.json())
    .then((events) => {
      const hotContent = document.querySelector(".hot-content");
      hotContent.innerHTML = ""; // ล้างข้อมูลเก่า

      events.forEach((event, index) => {
        const eventCard = document.createElement("div");
        eventCard.classList.add("hot-event-card");
        eventCard.dataset.eventId = event.id;

        // ✅ แปลง `tags` จาก String เป็น Array และจำกัดให้แสดงแค่ 3 อัน
        let tagsArray = (event.tags || "").split(",");
        let limitedTags = tagsArray.slice(0, 3); // เอาแค่ 3 อันแรก
        let tagButtons = limitedTags
          .map((tag) => `<button class="tag-button">${tag.trim()}</button>`)
          .join(" ");

        // ✅ ถ้ามีแท็กมากกว่า 3 อัน ให้ขึ้น "..."
        if (tagsArray.length > 3) {
          tagButtons += `<span class="more-tags"> +${
            tagsArray.length - 3
          } more</span>`;
        }

        eventCard.innerHTML = `
                    <div class="hot-rank">${index + 1}</div>
                    <div class="hot-event-content">
                        <div class="event-header">
                            <h3 class="event-title">${
                              event.title
                            } <span class="creator">สร้างโดย ${
          event.creator
        }</span></h3>
                            <span class="event-views">${
                              event.viewCount
                            } <br>views</span>
                        </div>
                        <div class="event-body">
                        <div class="participants">👤 ${
                          event.currentParticipants
                        } / ${event.maxParticipants} @<span class="location">${
          event.location
        }</span></div>
                        <div class="tags-container">Tags:${tagButtons}</div>
                        </div>
                    </div>
                `;

        hotContent.appendChild(eventCard);
      });

      document.querySelectorAll(".hot-event-card").forEach((card) => {
        card.addEventListener("click", function (e) {
          // ตรวจสอบว่าไม่ได้กดปุ่มแท็ก
          if (!e.target.classList.contains("tag-button")) {
            window.location.href = `/Event/Details/${this.dataset.eventId}`;
          }
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching hot events:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  function fetchEvents() {
    fetch("/Event/GetRecentEvents")
      .then((response) => response.json())
      .then((events) => {
        const recentContent = document.querySelector(".recent-content");
        recentContent.innerHTML = ""; // ล้างข้อมูลเก่า

        if (!events || events.length === 0) {
          recentContent.innerHTML =
            "<p style='text-align:center; color:gray;'>ไม่มีอีเวนต์ล่าสุด</p>";
          return;
        }
        events.forEach((event, index) => {
          const eventCard = document.createElement("div");
          eventCard.classList.add("recent-event-card");
          eventCard.dataset.eventId = event.id;

          // ✅ จำกัดจำนวนแท็กที่แสดง (3 อันแรก)
          let tagsArray = (event.tags || "").split(",");
          let limitedTags = tagsArray.slice(0, 3);
          let tagButtons = limitedTags
            .map((tag) => `<button class="tag-button">${tag.trim()}</button>`)
            .join(" ");

          // ✅ ถ้ามีแท็กมากกว่า 3 อัน ให้ขึ้น "+X more"
          if (tagsArray.length > 3) {
            tagButtons += `<span class="more-tags"> +${
              tagsArray.length - 3
            } more</span>`;
          }

          // ✅ จำกัดความยาวของชื่อสถานที่
          let locationDisplay =
            event.location.length > 20
              ? event.location.substring(0, 20) + "..."
              : event.location;

          // ✅ แปลงเวลาเป็นข้อความที่อ่านง่าย (เช่น "5 นาทีที่แล้ว")
          const formattedTime = timeAgo(new Date(event.createdAt));

          const formattedEventTime = formatEventTime(event.eventTime);

          eventCard.innerHTML = `
                      <span class="event-time">${formattedTime}</span>
                      <div class="recent-event-content">
                          <div class="event-header">
                              <h3 class="event-title">${event.title} <span class="Time"> ${formattedEventTime}</span></h3>
                          </div>
                          <div class="event-body">
                              <div class="creator">Host By: ${event.creator}</div>
                              <div class="participants"><i class="fa-solid fa-user"></i> ${event.currentParticipants} / ${event.maxParticipants} @<span class="location">${locationDisplay}</span></div>
                              <div class="tags-container">Tags:${tagButtons}</div>
                          </div>
                      </div>
                  `;
          recentContent.appendChild(eventCard);
        });

        document.querySelectorAll(".recent-event-card").forEach((card) => {
          card.addEventListener("click", function (e) {
            if (!e.target.classList.contains("tag-button")) {
              window.location.href = `/Event/Details/${this.dataset.eventId}`;
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching recent events:", error);
      });
  }

  // ✅ เรียก fetchEvents() ครั้งแรกตอนหน้าโหลด
  fetchEvents();

  // ✅ ตั้งให้ดึงข้อมูลใหม่ทุก 30 วินาที (ปรับค่าได้)
  setInterval(fetchEvents, 30000);

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} Minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} Hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} Days ago`;
  }

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
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("/Event/GetEventUpcoming") // ✅ ดึงข้อมูลจาก API
    .then((response) => response.json())
    .then((events) => {
      const eventContainer = document.querySelector(".upcoming-content");
      eventContainer.innerHTML = ""; // ✅ ล้างข้อมูลเก่าก่อนโหลดใหม่

      if (!events || events.length === 0) {
        eventContainer.innerHTML =
          "<p style='text-align:center; color:gray;'>ไม่มีอีเวนต์ล่าสุด</p>";
        return;
      }

      events.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.classList.add("upcoming-event-card");

        // ✅ แปลงวันที่ให้เป็นฟอร์แมตที่ต้องการ
        const formattedEventTime = formatEventTime(event.eventTime);

        eventCard.innerHTML = `
                    <h3 class="event-title">${event.title} <span class="Time">${formattedEventTime}</span></h3>
                    <p class="event-info">สร้างโดย <span class="event-creator">${event.creator}</span> 
                        <i class="fa-solid fa-user"></i> ${event.currentParticipants} @${event.location}
                    </p>
                    <div class="event-details-container">
                        <a href="/Event/Details/${event.id}" class="event-details">more details...</a>
                    </div>
                `;

        eventContainer.appendChild(eventCard);
      });
    })
    .catch((error) => console.error("❌ Error fetching events:", error));
});

// ✅ ฟังก์ชันแปลงเวลา
function formatEventTime(isoDate) {
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} at ${hours}:${minutes} ${ampm}`;
}
