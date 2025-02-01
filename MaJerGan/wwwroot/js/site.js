document.addEventListener("DOMContentLoaded", function () {
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");
  const slidesContainer = document.querySelector(".slides-container");
  const addEventButton = document.querySelector(".add-event");

  let scrollAmount = slidesContainer.scrollLeft; // ตั้งค่าเริ่มต้นเป็นตำแหน่ง scroll ปัจจุบัน
  const slideWidth = 110; // กำหนดความกว้างของ slide
  const maxScroll = slidesContainer.scrollWidth - slidesContainer.clientWidth;

  // อัปเดต scrollAmount ทุกครั้งที่เลื่อน ScrollBar ด้วย mouse wheel
  slidesContainer.addEventListener("scroll", function () {
    scrollAmount = slidesContainer.scrollLeft;
  });

  // ปุ่มเลื่อนซ้าย
  prevButton.addEventListener("click", function () {
    scrollAmount -= slideWidth;
    if (scrollAmount < 0) scrollAmount = 0;
    slidesContainer.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });

  // ปุ่มเลื่อนขวา
  nextButton.addEventListener("click", function () {
    scrollAmount += slideWidth;
    if (scrollAmount > maxScroll) scrollAmount = maxScroll;
    slidesContainer.scrollTo({ left: scrollAmount, behavior: "smooth" });
  });

  // ใช้ Mouse Wheel เพื่อเลื่อนแนวนอนแทนเลื่อนขึ้น-ลง
  slidesContainer.addEventListener("wheel", function (event) {
    event.preventDefault(); // ป้องกันการเลื่อนหน้าเว็บ
    slidesContainer.scrollLeft += event.deltaY; // ใช้ deltaY เพื่อเลื่อนแท็บไปทางซ้าย-ขวา
  });

  addEventButton.addEventListener("click", function () {
    window.location.href = "/Create";
  });
});

