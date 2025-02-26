// document.getElementById("image-upload").addEventListener("change", function (event) {
//     const file = event.target.files[0];
//     if (file) {
//         const reader = new FileReader();
//         reader.onload = function (e) {
//             // สร้าง <img> เพื่อแสดงรูปที่เลือก
//             const imgPreview = document.createElement("img");
//             imgPreview.src = e.target.result;
//             imgPreview.style.maxWidth = "100px";
//             imgPreview.style.borderRadius = "10px";
//             imgPreview.style.marginTop = "10px";

//             // เพิ่มรูปเข้าไปใน preview-container
//             const previewContainer = document.getElementById("preview-container");
//             previewContainer.innerHTML = ""; // ล้างอันเก่าก่อน
//             previewContainer.appendChild(imgPreview);
//         };
//         reader.readAsDataURL(file);
//     }
// });


document.getElementById("image-upload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgPreview = document.getElementById("image-preview");
            imgPreview.src = e.target.result; // อัปเดตรูปภาพที่แสดง
            imgPreview.classList.add("uploaded"); // เพิ่ม class เพื่อปรับขนาด
        };
        reader.readAsDataURL(file);
    }
});
