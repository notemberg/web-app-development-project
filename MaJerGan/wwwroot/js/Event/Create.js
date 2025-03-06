document.addEventListener("DOMContentLoaded", function () {
  const addTagBtn = document.getElementById("add-tag-btn");
  const tagSearchContainer = document.getElementById("tag-search-container");
  const tagSearchInput = document.getElementById("custom-tag-input");
  const selectedTagsContainer = document.getElementById(
    "selected-tags-container"
  );
  const selectedTagsInput = document.getElementById("selected-tags");
  const tagCarousel = document.getElementById("tag-carousel");

  let selectedTags = new Set();
  let allTags = [];

  // ✅ โหลดแท็กจาก API และแสดงใน Carousel
  async function loadTags() {
    try {
      const response = await fetch("/api/tags");
      allTags = await response.json();
      allTags = allTags.map((tag) => tag.name);
      console.log("✅ All Tags:", allTags);
      renderTags("");
    } catch (error) {
      console.error("Error loading tags:", error);
    }
  }

  addTagBtn.addEventListener("click", function () {
    tagSearchContainer.style.display = "block";
    tagSearchContainer.style.opacity = "1";
  });

  tagSearchContainer.addEventListener("mouseleave", function () {
    hideTagSearch();
  });

  // ✅ แสดงแท็กที่มีอยู่ในระบบเป็น Carousel
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

        if (selectedTags.has(tag)) {
          button.classList.add("active");
        }

        tagCarousel.appendChild(button);
      });
  }

  // ✅ ค้นหาแท็กที่มีอยู่
  tagSearchInput.addEventListener("input", function () {
    renderTags(tagSearchInput.value.trim());
  });

  // ✅ เลือกแท็กจาก Carousel
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

  function autoSelectTag(tagName) {
    let tagButton = document.querySelector(`.tag-btn[data-tag="${tagName}"]`);
    if (tagButton) {
      tagButton.classList.add("active");
      selectedTags.add(tagName);
      updateTags();
    }
  }

  // ✅ เพิ่มแท็กใหม่เข้า Database
  tagSearchInput.addEventListener("keypress", async function (e) {
    if (e.key === "Enter" && tagSearchInput.value.trim() !== "") {
      let newTag = tagSearchInput.value.trim();
      tagSearchInput.value = "";
      e.preventDefault();

      let matchedTag = allTags.find(
        (tag) => tag.toLowerCase() === newTag.toLowerCase()
      );

      if (matchedTag) {
        autoSelectTag(matchedTag);
      } else {
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
            autoSelectTag(matchedTag);
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

  // ✅ อัปเดตแท็กที่เลือก
  function updateTags() {
    selectedTagsContainer.innerHTML = "";
    selectedTags.forEach((tag) => {
      let tagElement = document.createElement("div");
      tagElement.className = "selected-tag";
      tagElement.innerHTML = `${tag} <span class="remove-tag" data-tag="${tag}">❌</span>`;
      selectedTagsContainer.appendChild(tagElement);
    });

    selectedTagsInput.value = Array.from(selectedTags).join(",");

    document.querySelectorAll(".remove-tag").forEach((removeBtn) => {
      removeBtn.addEventListener("click", function () {
        let tagToRemove = removeBtn.getAttribute("data-tag").toLowerCase();
        selectedTags.forEach((existingTag) => {
          if (existingTag.toLowerCase() === tagToRemove) {
            selectedTags.delete(existingTag);
            document
              .querySelector(`.tag-btn[data-tag="${existingTag}"]`)
              .classList.remove("active");
          }
        });
        updateTags();
      });
    });
  }

  // ✅ ซ่อน Floating Box
  function hideTagSearch() {
    tagSearchContainer.style.opacity = "0";
    setTimeout(() => {
      tagSearchContainer.style.display = "none";
    }, 200);
  }

  // ✅ โหลดแท็กจากฐานข้อมูล
  loadTags();
});

document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("event-date");
  const timeInput = document.getElementById("event-time");
  const dateTimeInput = document.getElementById("event-datetime");

  function updateDateTime() {
      if (dateInput.value && timeInput.value) {
          dateTimeInput.value = `${dateInput.value}T${timeInput.value}:00`;
          console.log("✅ Updated DateTime:", dateTimeInput.value);
      }
  }

  // ✅ อัปเดตค่าแบบ Real-time ทุกครั้งที่มีการเปลี่ยนแปลง
  dateInput.addEventListener("input", updateDateTime);
  timeInput.addEventListener("input", updateDateTime);
});


// document.addEventListener("DOMContentLoaded", function () {
//   const genderRestrictedCheckbox = document.getElementById("isGenderRestricted");
//   const genderSelection = document.getElementById("genderSelection");

//   // ✅ ซ่อนตัวเลือกเพศถ้า Gender Restricted ไม่ได้ถูกเลือก
//   genderRestrictedCheckbox.addEventListener("change", function () {
//       if (this.checked) {
//           genderSelection.style.display = "flex";
//       } else {
//           genderSelection.style.display = "none";
//       }
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
    const genderRestrictedCheckbox = document.getElementById("IsGenderRestricted");
    const genderSelection = document.getElementById("genderSelection");
    const genderCheckboxes = document.querySelectorAll("input[name='AllowedGender']");
    const hiddenGenderInput = document.getElementById("allowedGendersInput");

    // ✅ ซ่อน/แสดงตัวเลือกเพศเมื่อกดปุ่ม Gender Restricted
    genderRestrictedCheckbox.addEventListener("change", function () {
        genderSelection.style.display = this.checked ? "flex" : "none";
        if (!this.checked) {
            genderCheckboxes.forEach(checkbox => checkbox.checked = false);
            hiddenGenderInput.value = "Male,Female,Other"; // ล้างค่าถ้าปิด Gender Restricted
        }
    });

    // ✅ อัปเดตค่าใน hidden input เมื่อตัวเลือกเพศเปลี่ยนแปลง
    function updateHiddenGenderInput() {
        let selectedGenders = Array.from(genderCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        hiddenGenderInput.value = selectedGenders.join(",");
        console.log("✅ Updated AllowedGenders:", hiddenGenderInput.value);
    }

    genderCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", updateHiddenGenderInput);
    });

    // ✅ อัปเดตค่าก่อนส่งฟอร์ม
    document.querySelector("form").addEventListener("submit", function () {
        updateHiddenGenderInput(); // ✅ อัปเดตค่าก่อนส่งฟอร์ม
        console.log("🚀 Final AllowedGenders before submit:", hiddenGenderInput.value);
    });
});
