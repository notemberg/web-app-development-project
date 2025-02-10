const allTags = ['sports', 'boardgame', 'dinner', 'movies', 'books', 'hiking']; // จะต้องเติม tags ตามที่ต้องการ
const selectedTags = new Set();
const tagCarousel = document.getElementById('tag-carousel');

document.getElementById('search-tags').addEventListener('input', function() {
    renderTags(this.value);
});

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

function toggleTag(tag, button) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        button.classList.remove("active");
    } else {
        selectedTags.add(tag);
        button.classList.add("active");
    }
}

// ใช้งานฟังก์ชันนี้เพื่อแสดง tag ทั้งหมดเมื่อเริ่มต้น
renderTags('');
