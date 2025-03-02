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

    ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);

    ctx.restore();
}

// ✅ รองรับการเลื่อน (Pan) ทั้ง Mouse และ Touch
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

// ✅ รองรับมือถือ (Touch)
canvas.addEventListener("touchstart", startDrag, { passive: false });
canvas.addEventListener("touchmove", drag, { passive: false });
canvas.addEventListener("touchend", stopDrag);

function startDrag(e) {
    isDragging = true;
    let pos = getEventPosition(e);
    lastX = pos.x;
    lastY = pos.y;
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault(); // ป้องกันเว็บเลื่อนเอง

    let pos = getEventPosition(e);
    let dx = pos.x - lastX;
    let dy = pos.y - lastY;
    imgX += dx;
    imgY += dy;
    lastX = pos.x;
    lastY = pos.y;
    
    drawImage();
}

function stopDrag() {
    isDragging = false;
}

// ✅ ฟังก์ชันช่วยให้ใช้ได้ทั้ง Mouse และ Touch
function getEventPosition(e) {
    if (e.touches) {
        return {
            x: e.touches[0].clientX - canvas.getBoundingClientRect().left,
            y: e.touches[0].clientY - canvas.getBoundingClientRect().top
        };
    } else {
        return { x: e.offsetX, y: e.offsetY };
    }
}

// ✅ ปรับ Zoom ด้วย Range Slider
function setZoom(value) {
    scale = parseFloat(value);
    drawImage();
}

// ✅ อัปโหลดภาพหลังจาก Crop
function cropAndUpload() {
    canvas.toBlob((blob) => {
        const file = new File([blob], "profile.png", { type: "image/png" });
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
