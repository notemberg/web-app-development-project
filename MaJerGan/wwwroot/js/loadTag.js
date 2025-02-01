document.addEventListener("DOMContentLoaded", function () {
    const tagCarousel = document.getElementById("tag-carousel");
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const tagSearch = document.getElementById("custom-tag-input");
    const selectedTagsContainer = document.getElementById("selected-tags-container");
    const selectedTagsInput = document.getElementById("selected-tags");

    let selectedTags = new Set();
    let allTags = [];

    // ✅ โหลดแท็กจาก API
    async function loadTags() {
        try {
            const response = await fetch("/api/tags");
            allTags = await response.json();
            renderTags();
        } catch (error) {
            console.error("Error loading tags:", error);
        }
    }

    // ✅ สร้างปุ่มแท็กใน Carousel
    function renderTags() {
        tagCarousel.innerHTML = "";
        allTags.forEach(tag => {
            let button = document.createElement("button");
            button.className = "tag-btn";
            button.innerText = tag;
            button.dataset.tag = tag;
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
            selectedTags.add(tag);
            button.classList.add("active");
        }
        updateTags();
    }

    function updateTags() {
        selectedTagsContainer.innerHTML = "";
        selectedTags.forEach(tag => {
            let tagElement = document.createElement("div");
            tagElement.className = "selected-tag";
            tagElement.innerHTML = `${tag} <span class="remove-tag" data-tag="${tag}">❌</span>`;
            selectedTagsContainer.appendChild(tagElement);
        });

        selectedTagsInput.value = Array.from(selectedTags).join(",");
    }

    // ✅ เพิ่มแท็กใหม่เข้า Database
    tagSearch.addEventListener("keypress", async function (e) {
        if (e.key === "Enter" && tagSearch.value.trim() !== "") {
            let newTag = tagSearch.value.trim();
            tagSearch.value = "";
            e.preventDefault();

            try {
                const response = await fetch("/api/tags", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newTag })
                });

                if (response.ok) {
                    const addedTag = await response.json();
                    allTags.push(addedTag.name);
                    renderTags();
                } else if (response.status === 409) {
                    alert("แท็กนี้มีอยู่แล้ว!");
                } else {
                    throw new Error("Error adding tag");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    });

    // ✅ ลบแท็กที่เลือก
    selectedTagsContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-tag")) {
            let tag = e.target.getAttribute("data-tag");
            selectedTags.delete(tag);
            document.querySelector(`.tag-btn[data-tag="${tag}"]`)?.classList.remove("active");
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
