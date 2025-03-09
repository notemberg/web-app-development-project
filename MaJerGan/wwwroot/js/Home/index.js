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
        const formattedTime = timeAgo(new Date(event.createdAt));

        const formattedEventTime = formatEventTime(event.eventTime);
        eventCard.innerHTML = `
                 <div class="hot-container">
                    <div class="hot-picture">
                      <img src="https://down-th.img.susercontent.com/file/th-11134207-7r98p-llmayxgu7hor64" width="200" height="200" />
  
                    </div>
                    <div class="hot-info-container">
                        <div class="">
                            <h3 class="">${event.title} 
                            
                        </div>
                        <div>
                        <span class="">Host: ${event.creator}</span></h3>
                        </div>
                        <div>
                        <span class="">Event Date: ${formattedEventTime} <br></span>
                        </div>

                        <div class="">
                        <div class="">👤 ${event.currentParticipants} / ${event.maxParticipants} ${event.AllowedGenders} ${event.LocationImage}</div>
                        <div class=""> @<span class="">${event.location}</span> </div>
                    </div>
                        <div class="">
                                <span class="">Tags: ${tagButtons}</span> 
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

// ✅ Function to create hot event card (Show views instead of time)
function createEventCard(event) {
  const eventCard = document.createElement("div");
  eventCard.classList.add("hot-event-card");

  let locationDisplay =
    event.location.length > 20
      ? event.location.substring(0, 20) + "..."
      : event.location;

  eventCard.innerHTML = `
    <a href="/Event/Details/${event.id}">
        <h3 class="event-title">
            <span class="title-name">${event.title}</span> 
            <span class="event-views">${event.viewCount} views</span>
        </h3>
        <p class="event-info">
            Host: <span class="event-creator">${event.creator}&ensp;</span> 
            <i class="fa-solid fa-user"></i>${event.currentParticipants}&ensp;
           <span class="location"><i class="fa-solid fa-location-dot"></i> ${locationDisplay}</span>

        </p>
    </a>
  `;

  return eventCard;
}

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
            event.location.length > 30
              ? event.location.substring(0, 30) + "..."
              : event.location;

          let titleDisplay =
            event.title.length > 10
              ? event.title.substring(0, 10) + "..."
              : event.title;

          // ✅ แปลงเวลาเป็นข้อความที่อ่านง่าย (เช่น "5 นาทีที่แล้ว")
          const formattedTime = timeAgo(new Date(event.createdAt));

          const formattedEventTime = formatEventTime(event.eventTime);

          eventCard.innerHTML = `
                      
                      <div class="recent-event-content">
                          
                          <div class="event-header">
                          
                              <h3 class="event-title">${titleDisplay} <span class="Time"> ${formattedEventTime}</span></h3>
                              <span class="event-time">${formattedTime}</span>
                          </div>
                          <div class="event-body">
                              <div class="creator">Host: ${event.creator}</div>
                              <div class="participants"><i class="fa-solid fa-user"></i> ${event.currentParticipants}/${event.maxParticipants} 
                              </div>
                              <span class="location"><i class="fa-solid fa-location-dot"></i> ${locationDisplay}</span>
                          </div>
                           <div class="tags-container">Tags:${tagButtons}</div>
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
  fetch("/Event/GetEventUpcoming")
    .then((response) => {
      if (response.status === 401) {
        showMessageCard("กรุณาเข้าสู่ระบบก่อน เพื่อดูอีเวนต์ของคุณ", true);
        throw new Error("❌ User is not logged in");
      }
      return response.json();
    })
    .then((events) => {
      const eventContainer = document.querySelector(".upcoming-content");
      const toggleButton = document.querySelector(".toggle-view-button");
      eventContainer.innerHTML = ""; // Clear previous content

      if (!events || events.length === 0) {
        showMessageCard("ยังไม่มีอีเวนต์ที่กำลังจะเกิดขึ้น");
        toggleButton.style.display = "none"; // Hide button if no events
        return;
      }

      // ✅ Sort events in ascending order (earliest first)
      events.sort((a, b) => new Date(a.eventTime) - new Date(b.eventTime));

      let isExpanded = false; // Track toggle state

      function updateEventList(showAll) {
        eventContainer.innerHTML = ""; // Clear events

        const eventsToShow = showAll ? events : events.slice(0, 3);
        eventsToShow.forEach((event) => {
          eventContainer.appendChild(createEventCard(event));
        });

        // ✅ Toggle button text
        toggleButton.textContent = showAll ? "View Less" : "View All";
      }

      // ✅ Initial view (show 3 events)
      updateEventList(false);

      // ✅ Handle "View All" / "View Less" toggle
      toggleButton.addEventListener("click", function () {
        isExpanded = !isExpanded;
        updateEventList(isExpanded);
      });

      // ✅ Show toggle button only if more than 3 events exist
      if (events.length > 3) {
        toggleButton.style.display = "inline-block";
      } else {
        toggleButton.style.display = "none";
      }
    })
    .catch((error) => console.error("❌ Error fetching events:", error));
});

// ✅ Function to create event card
function createEventCard(event) {
  const eventCard = document.createElement("div");
  eventCard.classList.add("upcoming-event-card");

  const formattedEventTime = formatEventTime(event.eventTime);
  let locationDisplay =
    event.location.length > 20
      ? event.location.substring(0, 20) + "..."
      : event.location;

  eventCard.innerHTML = `
  <a href="/Event/Details/${event.id}">
      <h3 class="event-title">
          <span class="title-name">${event.title}</span> 
          <span class="Time">${formattedEventTime}</span>
      </h3>
      <p class="event-info">
          Host: <span class="event-creator">${event.creator}&ensp;</span> 
          <i class="fa-solid fa-user"></i>${event.currentParticipants}&ensp;
          <span class="location"><i class="fa-solid fa-location-dot"></i> ${locationDisplay}</span>

      </p>
  </a>
  `;

  return eventCard;
}

// ✅ Function to format event time
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

// ✅ ฟังก์ชันแสดงข้อความเตือนเป็นการ์ด
function showMessageCard(message, isLoginMessage = false) {
  const eventContainer = document.querySelector(".upcoming-content");
  eventContainer.innerHTML = "";
  const messageCard = document.createElement("div");
  messageCard.classList.add("upcoming-event-card", "message-card");

  messageCard.innerHTML = `
        <h3 class="event-title">${message}</h3>
        ${
          isLoginMessage
            ? `<div class="login-container">
                  <a href="/auth/login" class="login-button">เข้าสู่ระบบ</a>
               </div>`
            : ""
        }
    `;

  eventContainer.appendChild(messageCard);
}

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
function openTab(evt, tabName) {
  let i, tabContent, tabButtons;

  // Hide all tab content
  tabContent = document.getElementsByClassName("tab-content");
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  // Remove active class from all buttons
  tabButtons = document.getElementsByClassName("tab-button");
  for (i = 0; i < tabButtons.length; i++) {
    tabButtons[i].classList.remove("active");
  }

  // Show active tab and set button to active
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}

// Default to first tab
document.addEventListener("DOMContentLoaded", () => {
  document.getElementsByClassName("tab-button")[0].click();
});
