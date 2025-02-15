// document.addEventListener("DOMContentLoaded", function () {
//   const allTags = [
//     "Game",
//     "Coding",
//     "Studying",
//     "Cafe",
//     "KMITL",
//     "GYM",
//     "Board Game",
//     "Boxing",
//     "Fitness",
//     "Valorant",
//     "Dinner",
//     "Sport",
//   ];
//   const selectedTags = new Set();
//   const tagCarousel = document.getElementById("tag-carousel-interest");

//   document.getElementById("search-tags").addEventListener("input", function () {
//     renderTags(this.value);
//   });

//   function renderTags(filterText) {
//     tagCarousel.innerHTML = "";
//     allTags
//       .filter((tag) => tag.toLowerCase().includes(filterText.toLowerCase()))
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
//       // ถ้าแท็กนี้ถูกเลือกแล้ว ยกเลิกการเลือก
//       selectedTags.delete(tag);
//       button.classList.remove("active");
//     } else {
//       // ถ้าแท็กนี้ยังไม่ถูกเลือก ตรวจสอบว่ามีแท็กอื่นถูกเลือกอยู่แล้วสามอันหรือไม่
//       if (selectedTags.size < 3) {
//         // ถ้ายังไม่ถึงสามอัน เพิ่มแท็กนี้ลงไป
//         selectedTags.add(tag);
//         button.classList.add("active");
//       } else {
//         // ถ้ามีสามอันแล้ว แสดงเตือนหรือไม่ทำอะไรเลย
//         alert("You can select up to 3 interests only.");
//       }
//     }
//   }

//   function goBack() {
//     window.history.back(); // ใช้เพื่อกลับไปยังหน้าก่อนหน้าในประวัติการเรียกดู
//   }
//   // Initialize with empty search to show all tags initially
//   renderTags("");
// });

// function goBack() {
//   window.history.back(); // ใช้เพื่อกลับไปยังหน้าก่อนหน้าในประวัติการเรียกดู
// }


document.addEventListener("DOMContentLoaded", async function () {
    const tagCarousel = document.getElementById("tag-carousel-interest");
    const searchInput = document.getElementById("search-tags");
    const suggestionBox = document.getElementById("suggestions");
    const selectedTags = new Set();
    const maxTags = 3;

      const init = [
    "Game",
    "Coding",
    "Studying",
    "Cafe",
    "KMITL",
    "GYM",
    "Board Game",
    "Boxing",
    "Fitness",
    "Valorant",
    "Dinner",
    "Sport",
  ];
    let allTags = [];

    async function fetchTags() {
        try {
            const response = await fetch(window.location.origin + "/api/tags"); // 🔥 เปลี่ยนเป็น API จริง
            const data = await response.json();
    
            console.log("Full API Response:", data); // ✅ ตรวจสอบว่า API คืนค่าอะไร
    
            // ✅ ตรวจสอบว่า data เป็น Array หรือ Object
            if (Array.isArray(data)) {
                allTags = data; // API คืนค่าเป็น Array ธรรมดา
            } else if (data && data.tags && Array.isArray(data.tags)) {
                allTags = data.tags; // API คืนค่าเป็น Object { tags: [...] }
            } else {
                console.error("Invalid data format received:", data);
                allTags = []; // ป้องกัน `undefined`
            }
    
            console.log("Fetched tags:", allTags); // ✅ ตรวจสอบค่า allTags
        } catch (error) {
            console.error("Error fetching tags:", error);
            allTags = ["Game", "Coding", "Studying", "Cafe", "KMITL", "GYM", "Board Game", "Boxing", "Fitness", "Valorant"];
        }
    }
    

    window.showSuggestions = function () {
        let filter = searchInput.value.toLowerCase();
        suggestionBox.innerHTML = "";

        if (!filter) {
            suggestionBox.style.display = "none";
            return;
        }

        let filteredTags = allTags.filter(tag => tag.toLowerCase().includes(filter));
        suggestionBox.style.display = filteredTags.length > 0 ? "block" : "none";

        filteredTags.forEach(tag => {
            let suggestionItem = document.createElement("div");
            suggestionItem.className = "suggestion-item";
            suggestionItem.innerText = tag;
            suggestionItem.onclick = () => {
                searchInput.value = tag; // อัพเดทค่าในช่องค้นหา
                suggestionBox.style.display = "none"; // ปิด dropdown
            };
            suggestionBox.appendChild(suggestionItem);
        });
    };

  function renderTags(filterText) {
    tagCarousel.innerHTML = "";
    init
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

      function toggleTag(tag, button) {
    if (selectedTags.has(tag)) {
      // ถ้าแท็กนี้ถูกเลือกแล้ว ยกเลิกการเลือก
      selectedTags.delete(tag);
      button.classList.remove("active");
    } else {
      // ถ้าแท็กนี้ยังไม่ถูกเลือก ตรวจสอบว่ามีแท็กอื่นถูกเลือกอยู่แล้วสามอันหรือไม่
      if (selectedTags.size < 3) {
        // ถ้ายังไม่ถึงสามอัน เพิ่มแท็กนี้ลงไป
        selectedTags.add(tag);
        button.classList.add("active");
      } else {
        // ถ้ามีสามอันแล้ว แสดงเตือนหรือไม่ทำอะไรเลย
        alert("You can select up to 3 interests only.");
      }
    }
  }
    

    function selectTag(tag) {
        if (selectedTags.size < maxTags) {
            selectedTags.add(tag);
            renderSelectedTags();
        } else {
            alert("You can select up to 3 interests only.");
        }
        searchInput.value = "";
        suggestionBox.style.display = "none";
    }

    function renderSelectedTags() {
        tagCarousel.innerHTML = "";
        selectedTags.forEach(tag => {
            let button = document.createElement("div");
            button.className = "tag-btn active";
            button.innerText = tag;
            button.onclick = () => {
                selectedTags.delete(tag);
                renderSelectedTags();
            };
            tagCarousel.appendChild(button);
        });
    }

    window.goBack = function () {
        window.history.back();
    };

    await fetchTags();
    renderTags("");
});


