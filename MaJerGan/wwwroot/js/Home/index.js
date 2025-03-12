document.addEventListener("DOMContentLoaded", function () {
  const addEventButton = document.querySelector(".add-event");

  addEventButton.addEventListener("click", function () {
    window.location.href = "/event/Create";
  });
});
document.addEventListener("DOMContentLoaded", function () {
  function fetchTopEventForEachTag() {
    fetch("/Event/GetEventForyou")
      .then((response) => response.json())
      .then((events) => {
        const forYouContent = document.querySelector(".foryou-events-section");
        if (!forYouContent) {
          console.error("Error: .foryou-events-section not found in the DOM");
          return;
        }
        forYouContent.innerHTML = ""; // Clear old content

        if (!events || events.length === 0) {
          forYouContent.innerHTML =
            "<p style='text-align:center; color:gray;'>No events available</p>";
          return;
        }

        let tagMap = new Map();
        let displayedEvents = new Set(); // Track displayed events

        events.forEach((event) => {
          if (!event.tags) return; // Ensure tags exist
          let tagsArray = (event.tags || "")
            .split(",")
            .map((tag) => tag.trim());

          tagsArray.forEach((tag) => {
            if (!tagMap.has(tag) && !displayedEvents.has(event.id)) {
              tagMap.set(tag, event); // Store only the first event per tag
              displayedEvents.add(event.id); // Mark event as displayed
            }
          });
        });

        displayedEvents.forEach((eventId) => {
          const event = events.find((e) => e.id === eventId);
          if (!event) return;
          const eventCard = document.createElement("div");
          eventCard.classList.add("hot-event-card"); // Match Hot Event format
          eventCard.dataset.eventId = event.id;
          const formattedGender = getGenderIndicators(event.allowedGenders);
          const formattedEventTime = formatEventTime(event.eventTime);
          let tagsArray = (event.tags || "").split(",");
          let limitedTags = tagsArray
            .slice(0, 3)
            .map((tag) => `<button class="tag-button">${tag.trim()}</button>`)
            .join(" ");

          if (tagsArray.length > 3) {
            limitedTags += `<span class="more-tags"> +${
              tagsArray.length - 3
            } more</span>`;
          }

          eventCard.innerHTML = `
              <div class="hot-container">
                  <div class="hot-picture">
                      <img src="${
                        event.locationImage
                      }" width="200" height="200" />
                  </div>
                  <div class="hot-info-container">
                      <h3 class="home-event-title">${event.title}</h3>
                      <div>
                          <span class="home-host-event">Host: ${
                            event.creator
                          }</span>
                      </div>
                      <div>
                          <span class="home-time-event">Event Date: ${formattedEventTime} <br></span>
                      </div>
                      <div>
                          <i class="fa-solid fa-user"></i> ${
                            event.currentParticipants || 0
                          } / ${
            event.maxParticipants || 0
          }&ensp;${formattedGender}
                      </div>
                      <div>
                          <span class="location"><i class="fa-solid fa-location-dot"></i> ${
                            event.locationName || "Unknown"
                          }</span>
                      </div>
                      <div>
                          <span class="">Tags: ${limitedTags}</span> 
                      </div>
                  </div>
              </div>
            `;

          forYouContent.appendChild(eventCard);
        });

        document.querySelectorAll(".hot-event-card").forEach((card) => {
          card.addEventListener("click", function (e) {
            if (!e.target.classList.contains("tag-button")) {
              window.location.href = `/Event/Details/${this.dataset.eventId}`;
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error fetching events for 'For You':", error);
      });
  }

  fetchTopEventForEachTag(); // Fetch data when page loads
  setInterval(fetchTopEventForEachTag, 30000); // Refresh every 30 seconds

  function formatEventTime(isoDate) {
    if (!isoDate) return "Unknown Date";
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "Invalid Date";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} at ${hours}:${minutes} ${ampm}`;
  }
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

        const formattedEventTime = formatEventTimeFullYear(event.eventTime);
        const formattedGender = getGenderIndicators(event.allowedGenders);
        eventCard.innerHTML = `
                 <div class="hot-container">
                    <div class="hot-picture">
                      <img src="${event.locationImage}" width="200" height="200" />
  
                    </div>
                    <div class="hot-info-container">
                        <div class="">
                            <h3 class="home-event-title">${event.title} 
                            
                        </div>
                        <div>
                        <span class="home-host-event">Host: ${event.creator}</span></h3>
                        </div>
                        <div>
                        <span class="home-time-event">Event Date: ${formattedEventTime} <br></span>
                        </div>

                        <div class="">
                        <div class=""><i class="fa-solid fa-user"></i> ${event.currentParticipants} / ${event.maxParticipants} ${formattedGender} </div>
                        <div class=""> <span class="location"><i class="fa-solid fa-location-dot"></i> ${event.locationName}</span> </div>
                    </div>
                        <div class="">
                                <span class="">Tags: ${tagButtons}</span> 
                        </div>
                  </div>
                  
                `;

        console.log(event);
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

function formatEventTimeFullYear(isoDate) {
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

document.addEventListener("DOMContentLoaded", function () {
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

        // จำกัดความยาวของชื่ออีเวนต์
        let titleDisplay =
          event.title.length > 20
            ? event.title.substring(0, 20) + "..."
            : event.title;

        // จำกัดความยาวของสถานที่

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

        // let titleDisplay =
        //   event.title.length > 10
        //     ? event.title.substring(0, 10) + "..."
        //     : event.title;

        // ✅ แปลงเวลาเป็นข้อความที่อ่านง่าย (เช่น "5 นาทีที่แล้ว")
        const formattedTime = timeAgo(new Date(event.createdAt));

        const formattedEventTime = formatEventTime(event.eventTime);
        //     <h3 class="event-title">
        //     <span class="title-name">${event.title}</span>
        //     <span class="Time">${formattedEventTime}</span>
        // </h3>

        eventCard.innerHTML = `
      <div class="recent-event-content">
          <div class="event-header">
              <h3 class="event-title">
                  <span class="title-name">${titleDisplay}</span>  
                  <span class="Time"> ${formattedEventTime}</span>
              </h3>
              <span class="event-time">${formattedTime}</span>
          </div>
          <div class="event-body">
              <div class="creator">Host: ${event.creator}</div>
              <div class="participants"><i class="fa-solid fa-user"></i> ${event.currentParticipants}/${event.maxParticipants} 
              &ensp;<span class="location"><i class="fa-solid fa-location-dot"></i> ${locationDisplay}</span>
              </div>
              
          </div>
          <div class="tags-container">Tags: ${tagButtons}</div>
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
      eventContainer.innerHTML = ""; // Clear previous content

      if (!events || events.length === 0) {
        showMessageCard("ยังไม่มีอีเวนต์ที่กำลังจะเกิดขึ้น");
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

      }

      updateEventList(false);
    })
    .catch((error) => console.error("❌ Error fetching events:", error));
});

// ✅ Function to create event card
function createEventCard(event) {
  const eventCard = document.createElement("div");
  eventCard.classList.add("upcoming-event-card");

  const formattedEventTime = formatEventTime(event.eventTime);


  eventCard.innerHTML = `
  <a href="/Event/Details/${event.id}">
      <h3 class="event-title">
          <span class="title-name">${event.title}</span> 
          <span class="Time">${formattedEventTime}</span>
      </h3>
      <p class="event-info">
          <span class="event-creator">Host:  ${event.creator}&ensp;</span> 
          <span><i class="fa-solid fa-user"></i>${event.currentParticipants}&ensp;</span>
          <span class="location"><i class="fa-solid fa-location-dot"></i> ${event.locationName}</span>

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
function getGenderIndicators(allowedGenders) {
  let genders = allowedGenders.split(","); // Split the genders if multiple exist
  let indicators = [];

  if (genders.includes("Male")) {
    indicators.push(
      `<div style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background-color: rgba(22, 188, 0, 0.7); color:white; text-align: center; line-height: 30px; font-weight: bold; border: 3px solid rgba(0, 0, 0, 0.1);margin-right: 5px;">M</div>`
    );
  }
  if (genders.includes("Female")) {
    indicators.push(
      `<div style="display: inline-block; width: 30px; height: 30px; border-radius: 50%; background-color: rgba(253, 56, 56, 0.7); color: white; text-align: center; line-height: 30px; font-weight: bold; border: 3px solid rgba(0, 0, 0, 0.1); margin-right: 5px;">F</div>
`
    );
  }
  if (genders.includes("Other")) {
    indicators.push(
      `<div style="display: inline-block; width: 60px; height: 30px; border-radius: 15px; background-color: #F5F5F5; color:rgb(92, 92, 92); text-align: center; line-height: 30px; font-weight: normal;border: 3px solid rgba(0, 0, 0, 0.1); ">
  OTH
</div>
`
    );
  }

  return indicators.join(""); // Join elements with no separator (they have margin for spacing)
}

// Default to first tab
document.addEventListener("DOMContentLoaded", () => {
  document.getElementsByClassName("tab-button")[0].click();
});
