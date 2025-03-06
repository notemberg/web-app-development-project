let img = new Image();
let canvas = document.getElementById("cropCanvas");
let ctx = canvas.getContext("2d");

let scale = 1,
  minZoom = 1,
  maxZoom = 2;
let imgX = 0,
  imgY = 0;
let isDragging = false;
let lastX = 0,
  lastY = 0;

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
    calculateMinZoom();
    imgX = (canvas.width - img.width * scale) / 2;
    imgY = (canvas.height - img.height * scale) / 2;
    document.getElementById("zoomRange").min = minZoom; // ✅ กำหนดค่า minZoom ใน slider
    document.getElementById("zoomRange").value = minZoom; // ✅ กำหนดค่า maxZoom ใน slider
    drawImage();
  };
}

// ✅ คำนวณค่า `minZoom` ให้สามารถซูมออกจนเห็นเต็มรูปภาพได้พอดี
function calculateMinZoom() {
  let scaleX = canvas.width / img.width;
  let scaleY = canvas.height / img.height;
  minZoom = Math.max(scaleX, scaleY) * 0.9; // ใช้ค่าสูงสุดเพื่อให้ภาพเต็มพื้นที่
  scale = minZoom;
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

// ✅ ปรับ Zoom ด้วย Range Slider โดยให้ซูมออกได้มากขึ้น
function setZoom(value) {
  scale = Math.max(minZoom, Math.min(value, maxZoom)); // จำกัดค่าระหว่าง minZoom และ maxZoom
  drawImage();
}

// ✅ รองรับการเลื่อน (Pan)
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);
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
  e.preventDefault();

  let pos = getEventPosition(e);
  imgX += pos.x - lastX;
  imgY += pos.y - lastY;
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
      y: e.touches[0].clientY - canvas.getBoundingClientRect().top,
    };
  } else {
    return { x: e.offsetX, y: e.offsetY };
  }
}

// ✅ อัปโหลดภาพหลังจาก Crop
function cropAndUpload() {
  document.getElementById("buttonText").innerText = "กำลังอัปโหลด...";
  document.getElementById("loadingSpinner").style.display = "inline-block";

  canvas.toBlob(
    (blob) => {
      const file = new File([blob], "profile.png", { type: "image/png" });
      uploadImage(file);
    },
    "image/png",
    1.0
  );
}

function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  fetch("/upload-profile-picture", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById("profilePreview").src = data.imageUrl;
        alert("Upload Successful!");
        closeCropModal();
      } else {
        alert("Upload failed: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Upload Error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    })
    .finally(() => {
      document.getElementById("buttonText").innerText = "บันทึก";
      document.getElementById("loadingSpinner").style.display = "none";
    });
}

function closeCropModal() {
  document.getElementById("cropModal").classList.remove("show");
}
