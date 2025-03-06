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
      let tagCarousel = document.getElementById("nav-tag-carousel");
      tagCarousel.innerHTML = "";
  
      allTags.forEach((tag, index) => {
          let button = document.createElement("a");
          button.href = `/Event/SearchPage?selectedTags=${tag.id}`; // ✅ ใช้ `id` แทน `name`
          button.className = "nav-tag-btn";
          button.innerText = tag.name; // ✅ แสดงชื่อแท็ก
          button.dataset.tag = tag.id; // ✅ ใช้ id เป็นค่า dataset
          button.classList.add(index % 2 === 0 ? "nav-yellow" : "nav-white");
  
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


function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("search-bar").addEventListener("input", function () {
    let clearBtn = document.getElementById("clear-btn");
    if (this.value.length > 0) {
        clearBtn.style.display = "block"; // แสดงปุ่ม X
    } else {
        clearBtn.style.display = "none"; // ซ่อนปุ่ม X
    }
  });
  
});

function clearSearch() {
  let input = document.getElementById("search-bar");
  input.value = "";
  document.getElementById("clear-btn").style.display = "none";
  input.focus(); // ให้ focus ที่ช่อง input ต่อ
}