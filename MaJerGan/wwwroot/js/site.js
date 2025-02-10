document.addEventListener("DOMContentLoaded", function () {

  const addEventButton = document.querySelector(".add-event");

  addEventButton.addEventListener("click", function () {
    window.location.href = "/Create";
  });
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("/Event/GetHotEvents")
        .then(response => response.json())
        .then(events => {
            const hotContent = document.querySelector(".hot-content");
            hotContent.innerHTML = ""; // ล้างข้อมูลเก่า

            events.forEach((event, index) => {
                const eventCard = document.createElement("div");
                eventCard.classList.add("hot-event-card");

                // ✅ แปลง `tags` จาก String เป็น Array และสร้างปุ่มแท็ก
                const tagButtons = (event.tags || "").split(",").map(tag => 
                    `<button class="tag-button">${tag.trim()}</button>`).join(" ");

                eventCard.innerHTML = `
                    <div class="hot-rank">${index + 1}</div>
                    <div class="hot-event-content">
                        <div class="event-header">
                            <h3 class="event-title">${event.title}</h3>
                            <p class="creator">สร้างโดย <span class="username">${event.creator}</span></p>
                            <span class="event-views">${event.viewCount} <br>views</span>
                        </div>
                        <div class="event-body">
                        <p class="participants">👤 ${event.currentParticipants} / ${event.maxParticipants} @Location</p>
                        <div class="tags-container">Tags:${tagButtons}</div>
                        </div>
                    </div>
                `;

                hotContent.appendChild(eventCard);
            });
        })
        .catch(error => {
            console.error("Error fetching hot events:", error);
        });
});





