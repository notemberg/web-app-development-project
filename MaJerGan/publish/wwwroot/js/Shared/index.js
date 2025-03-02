document.addEventListener("DOMContentLoaded", function () {
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");
    const slidesContainer = document.querySelector(".slides-container");
    const addEventButton = document.querySelector(".add-event");
  
    const tagCarousel = document.getElementById("nav-tag-carousel");
    const prevBtn = document.getElementById("nav-prev-btn");
    const nextBtn = document.getElementById("nav-next-btn");
  
    let allTags = [];
  
    async function loadTags() {
      try {
        const response = await fetch(window.location.origin + "/api/tags");
        allTags = await response.json();
        renderTags();
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    }
  
    // render tags
    function renderTags() {
      tagCarousel.innerHTML = "";
      allTags
        .forEach((tag,index) => {
          let button = document.createElement("div");
          button.className = "nav-tag-btn";
          button.innerText = tag;
          button.dataset.tag = tag;
          button.classList.add(index % 2 === 0 ? "nav-yellow" : "nav-white");
          button.addEventListener("click", function () {
            toggleTag(tag, button);
          });
          tagCarousel.appendChild(button);
        });
    }
  
    
  
    prevBtn.addEventListener("click", function () {
      tagCarousel.scrollBy({ left: -150, behavior: "smooth" });
    });
  
    nextBtn.addEventListener("click", function () {
      tagCarousel.scrollBy({ left: 150, behavior: "smooth" });
    });
  
    let scrollAmount = tagCarousel.scrollLeft; // ตั้งค่าเริ่มต้นเป็นตำแหน่ง scroll ปัจจุบัน
    const slideWidth = 150; // กำหนดความกว้างของ slide
    const maxScroll = tagCarousel.scrollWidth - tagCarousel.clientWidth;
    
    tagCarousel.addEventListener("scroll", function () {
      scrollAmount = tagCarousel.scrollLeft;
    });
  
    tagCarousel.addEventListener("wheel", function (event) {
      event.preventDefault(); // ป้องกันการเลื่อนหน้าเว็บ
      tagCarousel.scrollLeft += event.deltaY; // ใช้ deltaY เพื่อเลื่อนแท็บไปทางซ้าย-ขวา
  });
  
  
    loadTags();

  });
  
  document.addEventListener("DOMContentLoaded", function () {
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    profileButton.addEventListener("click", function () {
        profileDropdown.style.display =
            profileDropdown.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", function (event) {
        if (!profileButton.contains(event.target) && !profileDropdown.contains(event.target)) {
            profileDropdown.style.display = "none";
        }
    });
});
