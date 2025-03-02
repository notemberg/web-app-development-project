let img = new Image();
let canvas = document.getElementById("cropCanvas");
let ctx = canvas.getContext("2d");

let scale = 1;
let imgX = 0;
let imgY = 0;
let isDragging = false;
let lastX = 0, lastY = 0;

function selectImage() {
    document.getElementById("imageUpload").click();
}

function showCropper(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        img.src = e.target.result;
        document.getElementById("cropModal").classList.add("show");
    };
    reader.readAsDataURL(file);

    img.onload = function () {
        imgX = 0;
        imgY = 0;
        scale = 1;
        drawImage();
    };
}

function drawImage() {
    canvas.width = 300;
    canvas.height = 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let imgWidth = img.width * scale;
    let imgHeight = img.height * scale;

    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.clip();

    // ✅ วาดรูปภาพ
    ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);

    // ✅ สร้าง Gradient ให้ขอบจางลง
    let gradient = ctx.createRadialGradient(150, 150, 130, 150, 150, 150);
    gradient.addColorStop(0.85, "rgba(0, 0, 0, 0)");  // โปร่งใสตรงกลาง
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.5)"); // ขอบจางลง

    // ✅ ใช้ Composite เพื่อทำให้ขอบจาง
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over"; // รีเซ็ตโหมดปกติ

    ctx.restore();
}


// ✅ เพิ่มฟังก์ชัน Pan (เลื่อนรูป)
canvas.addEventListener("mousedown", function (e) {
    isDragging = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener("mousemove", function (e) {
    if (isDragging) {
        let dx = e.offsetX - lastX;
        let dy = e.offsetY - lastY;
        imgX += dx;
        imgY += dy;
        lastX = e.offsetX;
        lastY = e.offsetY;
        drawImage();
    }
});

canvas.addEventListener("mouseup", function () {
    isDragging = false;
});

canvas.addEventListener("mouseleave", function () {
    isDragging = false;
});

// ✅ ปรับ Zoom ด้วย Range Slider
function setZoom(value) {
    scale = parseFloat(value);
    drawImage();
}

// ✅ อัปโหลดภาพหลังจาก Crop
function cropAndUpload() {
    canvas.toBlob((blob) => {
        const file = new File([blob], "profile.png", { type: "image/png" }); // ✅ ใช้ PNG เพื่อรักษาความโปร่งใส
        uploadImage(file);
        closeCropModal();
    }, "image/png", 1.0);
}


function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    fetch("/upload-profile-picture", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("profilePreview").src = data.imageUrl;
            alert("Upload Successful!");
        } else {
            alert("Upload failed: " + data.message);
        }
    })
    .catch(error => console.error("Upload Error:", error));
}

function closeCropModal() {
    document.getElementById("cropModal").classList.remove("show");
}
