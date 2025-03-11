document.addEventListener("DOMContentLoaded", async function () {
  const tagCarousel = document.getElementById("tag-carousel-interest");
  const searchInput = document.getElementById("search-tags");
  const suggestionBox = document.getElementById("suggestions");
  const customTagsContainer = document.createElement("div");

  customTagsContainer.id = "custom-tags";
  customTagsContainer.style.display = "flex";
  customTagsContainer.style.flexWrap = "wrap";
  customTagsContainer.style.justifyContent = "center";
  customTagsContainer.style.gap = "10px";
  tagCarousel.before(customTagsContainer);

  const selectedTags = new Set(); // ✅ แท็กที่เลือกจาก `initTags`
  const customSelectedTags = new Set(); // ✅ แท็กที่เพิ่มจากช่องค้นหา
  const maxTags = 3;

  const initTags = [
    "Game",
    "Coding",
    "Studying",
    "Cafe",
    "KMITL",
    "GYM",
    "Board Game",
    "Boxing",
    "Fitness",
    "Travel",
    "Dinner",
    "Sport",
  ];

  let allTags = [...initTags];

  async function fetchTags() {
    try {
      const response = await fetch(window.location.origin + "/api/tags");
      const data = await response.json();
      if (Array.isArray(data)) {
        allTags = [...new Set([...initTags, ...data.map((tag) => tag.name)])]; // ใช้แค่ค่า name
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
    renderTags(); // ✅ เรียก render ใหม่
  }

  function renderTags() {
    tagCarousel.innerHTML = "";
    initTags.forEach((tag) => {
      let button = document.createElement("div");
      button.className = "tag-btn";
      button.innerText = tag;
      button.dataset.tag = tag;

      if (selectedTags.has(tag)) {
        button.classList.add("active");
      }

      button.addEventListener("click", function () {
        toggleTag(tag, button);
      });

      tagCarousel.appendChild(button);
    });
  }

  function toggleTag(tag, button) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
      button.classList.remove("active");
    } else {
      if (selectedTags.size + customSelectedTags.size < maxTags) {
        selectedTags.add(tag);
        button.classList.add("active");
      } else {
        showPopup("แจ้งเตือน", "You can select up to 3 interests only.", "error");
      }
    }
    renderCustomTags();
  }

  window.showSuggestions = function () {
    let filter = searchInput.value.toLowerCase();
    suggestionBox.innerHTML = "";

    if (!filter) {
      suggestionBox.style.display = "none";
      return;
    }

    let filteredTags = allTags.filter((tag) =>
      tag.toLowerCase().includes(filter)
    );

    suggestionBox.style.display = filteredTags.length > 0 ? "block" : "none";

    filteredTags.forEach((tag) => {
      let suggestionItem = document.createElement("div");
      suggestionItem.className = "suggestion-item";
      suggestionItem.innerText = tag;
      suggestionItem.onclick = () => selectTag(tag);
      suggestionBox.appendChild(suggestionItem);
    });
  };

  function selectTag(tag) {
    if (selectedTags.size + customSelectedTags.size >= maxTags) {
      showPopup("แจ้งเตือน", "You can select up to 3 interests only.", "error");
      return;
    }

    // ✅ ถ้าแท็กอยู่ใน `initTags` ให้เลือกแทนที่จะเพิ่มใหม่
    if (initTags.includes(tag)) {
      let existingButton = document.querySelector(
        `.tag-btn[data-tag="${tag}"]`
      );
      if (existingButton) {
        toggleTag(tag, existingButton);
      }
    } else {
      if (!customSelectedTags.has(tag)) {
        customSelectedTags.add(tag);
        renderCustomTags();
      }
    }
    searchInput.value = "";
    suggestionBox.style.display = "none";
  }

  function renderCustomTags() {
    customTagsContainer.innerHTML = ""; // เคลียร์ก่อนอัปเดต

    customSelectedTags.forEach((tag) => {
      let tagElement = document.createElement("div");
      tagElement.className = "tag-btn active"; // ✅ ทำให้มีสีชมพู
      tagElement.innerText = tag;

      // ✅ เพิ่มปุ่มลบ
      let removeBtn = document.createElement("span");
      removeBtn.textContent = " ❌";
      removeBtn.className = "remove-btn";
      removeBtn.onclick = () => {
        customSelectedTags.delete(tag); // ✅ ลบออกจาก `customSelectedTags`
        renderCustomTags(); // ✅ รีเฟรช UI
        syncActiveTags(); // ✅ อัปเดตแท็กทั้งหมด
      };

      tagElement.appendChild(removeBtn);
      customTagsContainer.appendChild(tagElement);
    });

    syncActiveTags(); // ✅ ซิงค์สถานะแท็กทั้งหมด
  }

  function syncActiveTags() {
    document.querySelectorAll(".tag-btn").forEach((btn) => {
      let tag = btn.dataset.tag || btn.innerText.trim();
      if (selectedTags.has(tag) || customSelectedTags.has(tag)) {
        btn.classList.add("active"); // ✅ แท็กที่เลือกแล้วต้องมีสีชมพู
      }
    });
  }

  window.goBack = function () {
    window.history.back();
  };

  fetchTags();
});

document.addEventListener("DOMContentLoaded", function () {
  let userData = JSON.parse(localStorage.getItem("userData"));

  if (!userData) {
    // ✅ ถ้าไม่มีข้อมูล ให้กลับไปหน้า Register
    window.location.href = "register";
  }

  document
    .getElementById("createAccountBtn")
    .addEventListener("click", async function () {
      let selectedTags = Array.from(
        document.querySelectorAll(".tag-btn.active")
      ).map((tag) => tag.innerText);

      if (selectedTags.length === 0) {
        showPopup("แจ้งเตือน", "กรุณาเลือกอย่างน้อย 1 ความสนใจ!", "error");
        return;
      }

      // userData.userTags = Array.from(selectedTags).map(tag => ({ tag }))
      userData.userTags = selectedTags.map((tag) => ({
        tag: tag.replace(" ❌", "").trim(),
      }));
      console.log("User data:", userData);
      try {
        console.log("Sending data to server:", userData);
        let response = await fetch(window.location.origin + "/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        let result = await response.json();

        if (response.ok) {
          showPopup(
            "สำเร็จ",
            "สมัครสมาชิกสำเร็จ! กำลังพาคุณไปหน้า Login...",
            "success",
            function () {
              localStorage.removeItem("userData"); // ✅ ลบข้อมูลออก
              window.location.href = "login"; // ✅ ไปหน้า Login
            }
          );
        } else {
          showPopup(
            "เกิดข้อผิดพลาด",
            result.message || "ไม่สามารถสมัครสมาชิกได้",
            "error"
          );
          window.location.href = "register";
        }
      } catch (error) {
        console.error("Error:", error);
        showPopup(
          "เกิดข้อผิดพลาด",
          "เกิดปัญหาในการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง",
          "error"
        );
      }
    });
});

function showPopup(title, message, type = "error", callback = null) {
  let popupContent = document.querySelector(".popup-content");
  let popupTitle = document.getElementById("popupTitle");
  let popupText = document.getElementById("popupText");
  let okBtn = document.getElementById("popupOkBtn");

  popupTitle.innerText = title;
  popupText.innerText = message;
  document.getElementById("customPopup").style.display = "flex";

  // ✅ รีเซ็ตคลาสก่อน
  popupContent.classList.remove("success", "error");
  okBtn.classList.remove("success");

  // ✅ ถ้าเป็น "success" เปลี่ยนเป็นสีเขียว
  if (type === "success") {
    popupContent.classList.add("success");
    popupTitle.style.color = "#4CAF50"; // เปลี่ยนสีข้อความ
    okBtn.classList.add("success");
  } else {
    popupContent.classList.add("error");
    popupTitle.style.color = "#E53935"; // เปลี่ยนสีข้อความ
  }

  okBtn.onclick = function () {
    closePopup();
    if (callback) callback();
  };
}

function closePopup() {
  document.getElementById("customPopup").style.display = "none";
}
