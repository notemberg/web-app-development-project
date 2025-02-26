function sortEvents(sortOrder) {
    // สร้างคำขอ XMLHttpRequest สำหรับการส่งข้อมูลแบบ AJAX
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/Event/Search?searchQuery=" + encodeURIComponent('@Context.Request.Query["searchQuery"]') +
            "&selectedTag=" + encodeURIComponent('@Context.Request.Query["selectedTag"]') +
            "&sortOrder=" + encodeURIComponent(sortOrder), true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // ถ้าคำขอสำเร็จ, ทำการอัปเดตเนื้อหาภายใน #events-container
            document.getElementById('events-container').innerHTML = xhr.responseText;
            
            // เปลี่ยนสีปุ่มที่ถูกเลือก
            var links = document.querySelectorAll('.sort-options a');
            links.forEach(function(link) {
                link.classList.remove('active');
            });
            document.querySelector('a[data-sort="' + sortOrder + '"]').classList.add('active');
        }
    };

    xhr.send(); // ส่งคำขอ AJAX
}
