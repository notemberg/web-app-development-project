// document.addEventListener("DOMContentLoaded", function () {
//   const tagCarousel = document.getElementById("tag-carousel");
//   const prevBtn = document.getElementById("prev-btn");
//   const nextBtn = document.getElementById("next-btn");
//   const tagSearch = document.getElementById("custom-tag-input");
//   const selectedTagsContainer = document.getElementById(
//     "selected-tags-container"
//   );
//   const selectedTagsInput = document.getElementById("selected-tags");

//   let selectedTags = new Set();
//   let allTags = [];

//   // ✅ โหลดแท็กจาก API
//   async function loadTags() {
//     try {
//       const response = await fetch(window.location.origin + "/api/tags");
//       allTags = await response.json();
//       renderTags("");
//     } catch (error) {
//       console.error("Error loading tags:", error);
//     }
//   }

//   // ✅ ฟังก์ชันกรองแท็กใน Carousel
//   function renderTags(filterText) {
//     tagCarousel.innerHTML = "";
//     allTags
//       .filter((tag) => tag.toLowerCase().includes(filterText.toLowerCase())) // กรองแท็กตามการพิมพ์
//       .forEach((tag) => {
//         let button = document.createElement("div");
//         button.className = "tag-btn";
//         button.innerText = tag;
//         button.dataset.tag = tag;
//         button.addEventListener("click", function () {
//           toggleTag(tag, button);
//         });

//         if (selectedTags.has(tag)) {
//           button.classList.add("active");
//         }

//         tagCarousel.appendChild(button);
//       });
//   }

//   function toggleTag(tag, button) {
//     if (selectedTags.has(tag)) {
//       selectedTags.delete(tag);
//       button.classList.remove("active");
//     } else {
//       selectedTags.add(tag);
//       button.classList.add("active");
//     }
//     updateTags();
//   }

//   function updateTags() {
//     selectedTagsContainer.innerHTML = "";
//     selectedTags.forEach((tag) => {
//       let tagElement = document.createElement("div");
//       tagElement.className = "selected-tag";
//       tagElement.innerHTML = `${tag} <span class="remove-tag" data-tag="${tag}">❌</span>`;
//       selectedTagsContainer.appendChild(tagElement);
//     });

//     // ✅ ตรวจสอบว่าค่าแท็กที่เลือกถูกบันทึกใน `<input hidden>`
//     selectedTagsInput.value = Array.from(selectedTags).join(",");
//   }

//   // ✅ ฟังก์ชันเลือกแท็กอัตโนมัติถ้ามีพิมพ์อยู่แล้ว
//   function autoSelectTag(tagName) {
//     let tagButton = document.querySelector(`.tag-btn[data-tag="${tagName}"]`);
//     if (tagButton) {
//       tagButton.classList.add("active");
//       selectedTags.add(tagName);
//       updateTags();
//     }
//   }

//   // ✅ กรองแท็กและเลือกอัตโนมัติเมื่อผู้ใช้พิมพ์
//   tagSearch.addEventListener("input", function () {
//     let searchValue = tagSearch.value.trim();
//     renderTags(searchValue);

//     // ถ้าแท็กนี้มีอยู่แล้ว → เลือกอัตโนมัติ
//     // if (allTags.includes(searchValue)) {
//     //     autoSelectTag(searchValue);
//     // }
//   });

//   // ✅ เพิ่มแท็กใหม่เข้า Database และเลือกให้อัตโนมัติ
//   tagSearch.addEventListener("keypress", async function (e) {
//     if (e.key === "Enter" && tagSearch.value.trim() !== "") {
//       let newTag = tagSearch.value.trim();
//       tagSearch.value = "";
//       e.preventDefault();

//       let matchedTag = allTags.find(
//         (tag) => tag.toLowerCase() === newTag.toLowerCase()
//       );

//       if (matchedTag) {
//         autoSelectTag(matchedTag); // ✅ เลือกแท็กที่มีอยู่แล้ว
//       } else {
//         // ถ้าเป็นแท็กใหม่ → เพิ่มเข้า Database และเลือกให้อัตโนมัติ
//         try {
//           const response = await fetch("/api/tags", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ name: newTag }),
//           });

//           if (response.ok) {
//             const addedTag = await response.json();
//             allTags.push(addedTag.name);
//             renderTags("");
//             autoSelectTag(addedTag.name);
//           } else if (response.status === 409) {
//             alert("แท็กนี้มีอยู่แล้ว!");
//           } else {
//             throw new Error("Error adding tag");
//           }
//         } catch (error) {
//           console.error("Error:", error);
//         }
//       }
//     }
//   });

//   // ✅ ลบแท็กที่เลือก
//   selectedTagsContainer.addEventListener("click", function (e) {
//     if (e.target.classList.contains("remove-tag")) {
//       let tag = e.target.getAttribute("data-tag");
//       selectedTags.delete(tag);
//       document
//         .querySelector(`.tag-btn[data-tag="${tag}"]`)
//         ?.classList.remove("active");
//       updateTags();
//     }
//   });

//   // ✅ เลื่อนแท็กซ้าย-ขวา
//   prevBtn.addEventListener("click", function () {
//     tagCarousel.scrollBy({ left: -150, behavior: "smooth" });
//   });

//   nextBtn.addEventListener("click", function () {
//     tagCarousel.scrollBy({ left: 150, behavior: "smooth" });
//   });

//   // ✅ โหลดแท็กจากฐานข้อมูล
//   loadTags();
// });

// document.addEventListener("DOMContentLoaded", function () {
//   const addTagBtn = document.getElementById("add-tag-btn");
//   const tagSearchContainer = document.getElementById("tag-search-container");
//   const tagSearchInput = document.getElementById("custom-tag-input");
//   const selectedTagsContainer = document.getElementById("selected-tags-container");
//   const selectedTagsInput = document.getElementById("selected-tags");

//   let selectedTags = new Set();

//   // ✅ เปิด/ปิดช่องค้นหาเมื่อกดปุ่ม Add Tag
//   addTagBtn.addEventListener("click", function () {
//     tagSearchContainer.style.display =
//       tagSearchContainer.style.display === "none" ? "block" : "none";
//     tagSearchInput.focus();
//   });

//   // ✅ เมื่อกด Enter ให้เพิ่มแท็กใหม่
//   tagSearchInput.addEventListener("keypress", function (e) {
//     if (e.key === "Enter" && tagSearchInput.value.trim() !== "") {
//       let newTag = tagSearchInput.value.trim();
//       tagSearchInput.value = "";
//       e.preventDefault();

//       if (!selectedTags.has(newTag)) {
//         selectedTags.add(newTag);
//         updateTags();
//       }
//     }
//   });

//   // ✅ อัปเดตการแสดงผลของแท็กที่เลือก
//   function updateTags() {
//     selectedTagsContainer.innerHTML = "";
//     selectedTags.forEach((tag) => {
//       let tagElement = document.createElement("div");
//       tagElement.className = "selected-tag";
//       tagElement.innerHTML = `${tag} <span class="remove-tag" data-tag="${tag}">❌</span>`;
//       selectedTagsContainer.appendChild(tagElement);
//     });

//     selectedTagsInput.value = Array.from(selectedTags).join(",");

//     // ✅ ลบแท็กเมื่อกดปุ่ม ❌
//     document.querySelectorAll(".remove-tag").forEach((removeBtn) => {
//       removeBtn.addEventListener("click", function () {
//         let tag = removeBtn.getAttribute("data-tag");
//         selectedTags.delete(tag);
//         updateTags();
//       });
//     });
//   }
// });


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
