document.addEventListener("DOMContentLoaded", function () {
  const addTagBtn = document.getElementById("add-tag-btn");
  const tagSearchContainer = document.getElementById("tag-search-container");
  const tagSearchInput = document.getElementById("custom-tag-input");
  const selectedTagsContainer = document.getElementById("selected-tags-container");
  const selectedTagsInput = document.getElementById("selected-tags");

  let selectedTags = new Set();
  let isTagSelected = false;

  // ✅ แสดง Floating Box เมื่อ Hover ปุ่ม Add Tag
  addTagBtn.addEventListener("mouseenter", function () {
    tagSearchContainer.style.display = "block";
    tagSearchContainer.style.opacity = "1";
    tagSearchContainer.style.transform = "translateX(0px)";
  });

  // ✅ ซ่อน Floating Box เมื่อเมาส์ออกไป และยังไม่มีแท็กถูกเลือก
  tagSearchContainer.addEventListener("mouseleave", function () {
    if (!isTagSelected) {
      hideTagSearch();
    }
  });

  // ✅ เมื่อกด Enter ให้เพิ่มแท็กใหม่ (ไม่ให้ซ้ำกับที่เลือกไว้แล้ว)
  tagSearchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && tagSearchInput.value.trim() !== "") {
      let newTag = tagSearchInput.value.trim();
      let lowerCaseTag = newTag.toLowerCase(); // ✅ แปลงเป็นพิมพ์เล็ก
      tagSearchInput.value = "";
      e.preventDefault();

      // ✅ ตรวจสอบว่ามีแท็กเดียวกันอยู่แล้วหรือไม่ (ใน selectedTags)
      let isDuplicate = Array.from(selectedTags).some(
        (tag) => tag.toLowerCase() === lowerCaseTag
      );

      if (!isDuplicate) {
        selectedTags.add(newTag); // ✅ เพิ่มแท็กใหม่ (เก็บค่าตามที่ผู้ใช้พิมพ์)
        updateTags();
      } else {
        alert("แท็กนี้ถูกเลือกไปแล้ว!"); // แจ้งเตือนถ้าแท็กถูกเลือกแล้ว
      }

      isTagSelected = true;
      hideTagSearch();
    }
  });

  // ✅ ฟังก์ชันอัปเดตแท็กที่เลือก
  function updateTags() {
    selectedTagsContainer.innerHTML = "";
    selectedTags.forEach((tag) => {
      let tagElement = document.createElement("div");
      tagElement.className = "selected-tag";
      tagElement.innerHTML = `${tag} <span class="remove-tag" data-tag="${tag}">❌</span>`;
      selectedTagsContainer.appendChild(tagElement);
    });

    selectedTagsInput.value = Array.from(selectedTags).join(",");

    // ✅ ลบแท็กเมื่อกดปุ่ม ❌
    document.querySelectorAll(".remove-tag").forEach((removeBtn) => {
      removeBtn.addEventListener("click", function () {
        let tagToRemove = removeBtn.getAttribute("data-tag").toLowerCase(); // ✅ แปลงเป็นพิมพ์เล็ก
        selectedTags.forEach((existingTag) => {
          if (existingTag.toLowerCase() === tagToRemove) {
            selectedTags.delete(existingTag);
          }
        });
        updateTags();
      });
    });
  }

  // ✅ ฟังก์ชันซ่อน Floating Box
  function hideTagSearch() {
    tagSearchContainer.style.opacity = "0";
    setTimeout(() => {
      tagSearchContainer.style.display = "none";
      isTagSelected = false;
    }, 200);
  }
});

