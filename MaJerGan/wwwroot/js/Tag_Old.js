document.addEventListener("DOMContentLoaded", function () {
  const tagCarousel = document.getElementById("tag-carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const tagSearch = document.getElementById("custom-tag-input");
  const selectedTagsContainer = document.getElementById(
    "selected-tags-container"
  );
  const selectedTagsInput = document.getElementById("selected-tags");

  let selectedTags = new Set();
  let allTags = [];

  // ✅ โหลดแท็กจาก API
  async function loadTags() {
    try {
      const response = await fetch(window.location.origin + "/api/tags");
      allTags = await response.json();
      renderTags("");
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  }

  // ✅ ฟังก์ชันกรองแท็กใน Carousel
  function renderTags(filterText) {
    tagCarousel.innerHTML = "";
    allTags
      .filter((tag) => tag.toLowerCase().includes(filterText.toLowerCase())) // กรองแท็กตามการพิมพ์
      .forEach((tag) => {
        let button = document.createElement("div");
        button.className = "tag-btn";
        button.innerText = tag;
        button.dataset.tag = tag;
        button.addEventListener("click", function () {
          toggleTag(tag, button);
        });

        if (selectedTags.has(tag)) {
          button.classList.add("active");
        }

        tagCarousel.appendChild(button);
      });
  }

  function toggleTag(tag, button) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
      button.classList.remove("active");
    } else {
      selectedTags.add(tag);
      button.classList.add("active");
    }
    updateTags();
  }

  function updateTags() {
    selectedTagsContainer.innerHTML = "";
    selectedTags.forEach((tag) => {
      let tagElement = document.createElement("div");
      tagElement.className = "selected-tag";
      tagElement.innerHTML = `${tag} <span class="remove-tag" data-tag="${tag}">❌</span>`;
      selectedTagsContainer.appendChild(tagElement);
    });

    // ✅ ตรวจสอบว่าค่าแท็กที่เลือกถูกบันทึกใน `<input hidden>`
    selectedTagsInput.value = Array.from(selectedTags).join(",");
  }

  // ✅ ฟังก์ชันเลือกแท็กอัตโนมัติถ้ามีพิมพ์อยู่แล้ว
  function autoSelectTag(tagName) {
    let tagButton = document.querySelector(`.tag-btn[data-tag="${tagName}"]`);
    if (tagButton) {
      tagButton.classList.add("active");
      selectedTags.add(tagName);
      updateTags();
    }
  }

  // ✅ กรองแท็กและเลือกอัตโนมัติเมื่อผู้ใช้พิมพ์
  tagSearch.addEventListener("input", function () {
    let searchValue = tagSearch.value.trim();
    renderTags(searchValue);

  });

  // ✅ เพิ่มแท็กใหม่เข้า Database และเลือกให้อัตโนมัติ
  tagSearch.addEventListener("keypress", async function (e) {
    if (e.key === "Enter" && tagSearch.value.trim() !== "") {
      let newTag = tagSearch.value.trim();
      tagSearch.value = "";
      e.preventDefault();

      let matchedTag = allTags.find(
        (tag) => tag.toLowerCase() === newTag.toLowerCase()
      );

      if (matchedTag) {
        autoSelectTag(matchedTag); // ✅ เลือกแท็กที่มีอยู่แล้ว
      } else {
        // ถ้าเป็นแท็กใหม่ → เพิ่มเข้า Database และเลือกให้อัตโนมัติ
        try {
          const response = await fetch("/api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newTag }),
          });

          if (response.ok) {
            const addedTag = await response.json();
            allTags.push(addedTag.name);
            renderTags("");
            autoSelectTag(addedTag.name);
          } else if (response.status === 409) {
            alert("แท็กนี้มีอยู่แล้ว!");
          } else {
            throw new Error("Error adding tag");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }
    }
  });

  // ✅ ลบแท็กที่เลือก
  selectedTagsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-tag")) {
      let tag = e.target.getAttribute("data-tag");
      selectedTags.delete(tag);
      document
        .querySelector(`.tag-btn[data-tag="${tag}"]`)
        ?.classList.remove("active");
      updateTags();
    }
  });

  // ✅ เลื่อนแท็กซ้าย-ขวา
  prevBtn.addEventListener("click", function () {
    tagCarousel.scrollBy({ left: -150, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", function () {
    tagCarousel.scrollBy({ left: 150, behavior: "smooth" });
  });

  // ✅ โหลดแท็กจากฐานข้อมูล
  loadTags();
});


