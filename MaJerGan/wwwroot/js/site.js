document.addEventListener("DOMContentLoaded", function () {
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");
  const slidesContainer = document.querySelector(".slides-container");
  const addEventButton = document.querySelector(".add-event");

  // let scrollAmount = slidesContainer.scrollLeft; // ตั้งค่าเริ่มต้นเป็นตำแหน่ง scroll ปัจจุบัน
  // const slideWidth = 110; // กำหนดความกว้างของ slide
  // const maxScroll = slidesContainer.scrollWidth - slidesContainer.clientWidth;

  // // อัปเดต scrollAmount ทุกครั้งที่เลื่อน ScrollBar ด้วย mouse wheel
  // slidesContainer.addEventListener("scroll", function () {
  //   scrollAmount = slidesContainer.scrollLeft;
  // });

  // // ปุ่มเลื่อนซ้าย
  // prevButton.addEventListener("click", function () {
  //   scrollAmount -= slideWidth;
  //   if (scrollAmount < 0) scrollAmount = 0;
  //   slidesContainer.scrollTo({ left: scrollAmount, behavior: "smooth" });
  // });

  // // ปุ่มเลื่อนขวา
  // nextButton.addEventListener("click", function () {
  //   scrollAmount += slideWidth;
  //   if (scrollAmount > maxScroll) scrollAmount = maxScroll;
  //   slidesContainer.scrollTo({ left: scrollAmount, behavior: "smooth" });
  // });

  // // ใช้ Mouse Wheel เพื่อเลื่อนแนวนอนแทนเลื่อนขึ้น-ลง
  // slidesContainer.addEventListener("wheel", function (event) {
  //   event.preventDefault(); // ป้องกันการเลื่อนหน้าเว็บ
  //   slidesContainer.scrollLeft += event.deltaY; // ใช้ deltaY เพื่อเลื่อนแท็บไปทางซ้าย-ขวา
  // });

  // tag
  const tagCarousel = document.getElementById("tag-carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  let allTags = [];

  // ✅ โหลดแท็กจาก API
  async function loadTags() {
    try {
      const response = await fetch("/api/tags");
      allTags = await response.json();
      renderTags("");
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  }

  // render tags
  function renderTags(filterText) {
    tagCarousel.innerHTML = "";
    allTags
      .filter((tag) => tag.toLowerCase().includes(filterText.toLowerCase()))
      .forEach((tag) => {
        let button = document.createElement("div");
        button.className = "tag-btn";
        button.innerText = tag;
        button.dataset.tag = tag;
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

  renderTags("");

  addEventButton.addEventListener("click", function () {
    window.location.href = "/Create";
  });
});
