document.addEventListener("DOMContentLoaded", function () {
    let searchForm = document.getElementById("search-bar");
    let tagFilters = document.querySelectorAll('input[name="selectedTags"]');
    let sortLinks = document.querySelectorAll(".sort-link");

    // ✅ เมื่อพิมพ์ `searchQuery` ให้ค้นหาอัตโนมัติ
    searchForm.addEventListener("input", function () {
        updateSearchResults();
    });

    // ✅ เมื่อเลือก Tag ให้ค้นหาอัตโนมัติ
    tagFilters.forEach(tag => {
        tag.addEventListener("change", function () {
            updateSearchResults();
        });

    
    });


    document.addEventListener("DOMContentLoaded", function () {
        let searchBar = document.getElementById("search-bar");
    
        if (searchBar) {
            searchBar.addEventListener("input", function () {
                let searchQuery = searchBar.value.trim();
                if (searchQuery.length > 0) {
                    updateSearchResults(searchQuery);
                }
            });
        }
    });
    


    // ✅ เมื่อกดปุ่ม Sort ให้เปลี่ยน `sortOrder` และค้นหาใหม่
    sortLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
    
            console.log("Clicked:", this); // ✅ ดูว่า `this` คือปุ่มจริงไหม
            console.log("Dataset:", this.dataset); // ✅ ดูว่ามี `sort` หรือไม่
    
            if (this.dataset.sort) {
                document.getElementById("sortOrder").value = this.dataset.sort;
    
                // ลบ `active` class ออกจากปุ่มอื่น แล้วเพิ่มให้ปุ่มที่เลือก
                sortLinks.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");
    
                updateSearchResults();
            } else {
                console.error("❌ `data-sort` ไม่พบในปุ่มที่คลิก!");
            }
        });
    });
    

    // ✅ โหลดผลลัพธ์ครั้งแรก
    updateSearchResults();
});

function updateSearchResults() {
    let formData = new FormData(document.getElementById("search-form"));

    let searchForm = document.getElementById("search-bar").value;
    let selectedTags = document.querySelectorAll('input[name="selectedTags"]:checked');
    let sortOrder = document.getElementById("sortOrder").value;

    // ✅ เพิ่มค่า `searchQuery` และ `sortOrder` ลงใน `formData`
    formData.set("searchQuery", searchForm);
    formData.set("sortOrder", sortOrder);

    // ✅ เพิ่ม `selectedTags` ทีละค่า
    formData.delete("selectedTags"); // ล้างค่าเดิมก่อน
    selectedTags.forEach(tag => {
        formData.append("selectedTags", tag.value);
    });

    let queryParams = new URLSearchParams(formData).toString();

    fetch(`/Event/SearchResults?${queryParams}`)
        .then(response => response.text())
        .then(data => {
            let searchResults = document.getElementById("search-results");
            if (searchResults) {
                searchResults.innerHTML = data;
            } else {
                console.error("❌ Element with ID 'search-results' not found!");
            }
        })
        .catch(error => console.error("Error fetching search results:", error));
}

