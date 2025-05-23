document.addEventListener("DOMContentLoaded", function () {
  let searchForm = document.getElementById("search-bar");
  let tagFilters = document.querySelectorAll('input[name="selectedTags"]');
  let sortLinks = document.querySelectorAll(".sort-link");

  // ✅ เมื่อพิมพ์ `searchQuery` ให้ค้นหาอัตโนมัติ
  searchForm.addEventListener("input", function () {
    updateSearchResults();
  });

  // ✅ เมื่อเลือก Tag ให้ค้นหาอัตโนมัติ
  tagFilters.forEach((tag) => {
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

  // ✅ โหลดผลลัพธ์ครั้งแรก
  updateSearchResults();
});

function updateSearchResults() {
  let formData = new FormData(document.getElementById("search-form"));

  let searchForm = document.getElementById("search-bar").value;
  let selectedTags = document.querySelectorAll(
    'input[name="selectedTags"]:checked'
  );

  saveSelectedTags();
  let sortOrder = document.getElementById("sortOrder").value;

  // ✅ เพิ่มค่า `searchQuery` และ `sortOrder` ลงใน `formData`
  formData.set("searchQuery", searchForm);
  formData.set("sortOrder", sortOrder);

  // ✅ เพิ่ม `selectedTags` ทีละค่า
  formData.delete("selectedTags"); // ล้างค่าเดิมก่อน
  selectedTags.forEach((tag) => {
    formData.append("selectedTags", tag.value);
  });

  let queryParams = new URLSearchParams(formData).toString();

  fetch(`/Event/UpcomingEventsResults?${queryParams}`)
    .then((response) => response.text())
    .then((data) => {
      let searchResults = document.getElementById("search-results");
      if (searchResults) {
        searchResults.innerHTML = data;
      } else {
        console.error("❌ Element with ID 'search-results' not found!");
      }
    })
    .catch((error) => console.error("Error fetching search results:", error));
}


function openTagModal() {
    var modal = document.getElementById("tagModal");
    modal.style.display = "block";
}

function closeTagModal() {
    var modal = document.getElementById("tagModal");
    modal.style.display = "none";
}

function saveSelectedTags() {
    var selectedTags = [];
    var checkboxes = document.querySelectorAll('.tag-item input[type="checkbox"]:checked');

    console.log(checkboxes);
    
    checkboxes.forEach(function(checkbox) {
        selectedTags.push(checkbox.value);
    });

    console.log(selectedTags);

    // Update the selected tags input and display
    
    // Display selected tags in the parent form
    displaySelectedTags(selectedTags);

    // Close the modal
}

function searchTags() {
    var searchInput = document.getElementById('tag-search').value.toLowerCase();
    var tags = document.querySelectorAll('.tag-item');
    
    tags.forEach(function(tag) {
        var tagName = tag.getAttribute('data-tag').toLowerCase();
        if (tagName.includes(searchInput)) {
            tag.style.display = 'block';
        } else {
            tag.style.display = 'none';
        }
    });
}

function displaySelectedTags(selectedTags) {
    var selectedTagsContainer = document.getElementById('selected-tags');
    selectedTagsContainer.innerHTML = '';  // Clear the previous selected tags

    selectedTags.forEach(function(tagId) {
        var tagName = document.querySelector(`#tag-${tagId}`).nextElementSibling.textContent;
        var tagElement = document.createElement('span');
        tagElement.className = 'selected-tag';
        tagElement.innerHTML = `${tagName} <span onclick="removeTag('${tagName}', '${tagId}')" class="remove-tag">X</span>`;
        selectedTagsContainer.appendChild(tagElement);
    });
}

function removeTag(tagName, tagId) {
    // หาช่อง checkbox ที่เกี่ยวข้องกับ tagId นี้
    var tagCheckbox = document.querySelector(`.tag-item input[type="checkbox"][value="${tagId}"]`);

    if (tagCheckbox) {
        // ทำการ uncheck ช่อง checkbox ที่เกี่ยวข้อง
        tagCheckbox.checked = false;

        // แสดงแท็กที่เลือกใหม่
        var selectedTags = Array.from(document.querySelectorAll('.tag-item input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
        displaySelectedTags(selectedTags);
    } else {
        console.error("❌ ไม่พบ checkbox ที่เกี่ยวข้องกับ tagId:", tagId);
    }

    updateSearchResults();
}

document.addEventListener("DOMContentLoaded", function () {
  // ✅ ล้าง `selectedTags` จาก URL หลังโหลดหน้า
  if (window.history.replaceState) {
      const url = new URL(window.location);
      url.searchParams.delete("selectedTags");
      window.history.replaceState({}, "", url);
  }

  // document.getElementById("search-bar").value = ""; // ✅ ล้างค่า search query
});


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("search-bar-upcoming").addEventListener("input", function () {
    let clearBtn = document.getElementById("clear-btn2");
    if (this.value.length > 0) {
        clearBtn.style.display = "block"; // แสดงปุ่ม X
    } else {
        clearBtn.style.display = "none"; // ซ่อนปุ่ม X
    }
  });
  
});

function clearSearch() {
  let input = document.getElementById("search-bar-upcoming");
  input.value = "";
  document.getElementById("clear-btn2").style.display = "none";
  input.focus(); // ให้ focus ที่ช่อง input ต่อ
}