// เปิด Modal
function openPasswordModal() {
  document.getElementById("password").value = "";
  document.getElementById("new-password").value = "";
  document.getElementById("confirm-password").value = "";

  document.getElementById("passwordModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("passwordModal").style.display = "none";
}

function togglePassword(inputId, icon) {
  let input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

window.onclick = function (event) {
  let modal = document.getElementById("passwordModal");
  if (event.target === modal) {
    closeModal();
  }
};

function enableEdit() {
  document.getElementById("username").disabled = false;
  document.getElementById("username").style.cursor = "text";

  document.getElementById("email").disabled = false;
  document.getElementById("email").style.cursor = "text";

  document.getElementById("phone").disabled = false;
  document.getElementById("phone").style.cursor = "text";

  // ✅ ซ่อนปุ่ม Change Password และแสดงปุ่ม Update
  document.getElementById("change-password").style.display = "none";
  document.getElementById("update-btn").style.display = "block";
  document.getElementById("edit-btn").style.display = "none";
  document.getElementById("cancel-btn").style.display = "block";
  
}

function cancelEdit() {
  document.getElementById("username").disabled = true;
  document.getElementById("username").style.cursor = "not-allowed";

  document.getElementById("email").disabled = true;
  document.getElementById("email").style.cursor = "not-allowed";

  document.getElementById("phone").disabled = true;
  document.getElementById("phone").style.cursor = "not-allowed";

  // ✅ แสดงปุ่ม Change Password และซ่อนปุ่ม Update
  document.getElementById("change-password").style.display = "block";
  document.getElementById("update-btn").style.display = "none";
  document.getElementById("edit-btn").style.display = "block";
  document.getElementById("cancel-btn").style.display = "none";
}


async function saveProfile() {
  var updatedData = {
    Username: document.getElementById("username").value,
    Email: document.getElementById("email").value,
    Phone: document.getElementById("phone").value,
  };

  console.log("Sending Data:", updatedData);

  try {
    const response = await fetch("/Profile/Update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const result = await response.json();
    console.log("Response:", result);

    if (result.success) {
      alert(result.message);
      location.reload(); // รีโหลดหน้าเพื่อกลับไปสถานะแรก
    } else {
      alert("Failed: " + result.message);
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    alert("Error updating profile.");
  }
}

function uploadImage() {
  document.getElementById("imageUpload").click(); // ✅ เปิด File Picker
}

function previewAndUploadImage() {
  var fileInput = document.getElementById("imageUpload");
  var profilePreview = document.getElementById("profilePreview");

  if (fileInput.files && fileInput.files[0]) {
    var file = fileInput.files[0];

    // ✅ ตรวจสอบประเภทไฟล์ (เฉพาะ .jpg, .jpeg, .png)
    var allowedExtensions = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedExtensions.includes(file.type)) {
      alert("Only JPG, JPEG, and PNG files are allowed.");
      return;
    }

    // ✅ แสดง Preview รูปที่เลือก
    var reader = new FileReader();
    reader.onload = function (e) {
      profilePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // ✅ อัปโหลดรูปไปยัง API
    var formData = new FormData();
    formData.append("file", file);

    fetch("/upload-profile-picture", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          profilePreview.src = data.imageUrl; // ✅ อัปเดตรูปโปรไฟล์
          showPopup("Success", "Profile picture updated successfully!", "success");
        } else {
          alert("Upload failed: " + data.message);
        }
      })
      .catch((error) => {
        alert("Error uploading file: " + error);
      });
  }
}

async function submitChangePassword() {
  let userId = document.getElementById("userId").value;
  let oldPassword = document.getElementById("password").value;
  let newPassword = document.getElementById("new-password").value;
  let confirmPassword = document.getElementById("confirm-password").value;

  let requestData = {
    userId: userId,
    oldPassword: oldPassword,
    newPassword: newPassword,
    confirmNewPassword: confirmPassword,
  };

  try {
    let response = await fetch("/profile/changepassword", {
      // ✅ เปลี่ยนเส้นทางให้ตรงกับ API
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN":
          document.querySelector('input[name="__RequestVerificationToken"]')
            ?.value || "",
      },
      body: JSON.stringify(requestData),
    });

    let result = await response.json();
    if (result.success) {
      showPopup("Success", result.message, "success");

      closeModal();
    } else {
      showPopup("Error", result.message, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showPopup("Error", "Failed to change password.", "error");
  }
}

function showPopup(title, message, type = "error", callback = null) {
  let popupContent = document.querySelector(".popup-content");
  let popupTitle = document.getElementById("popupTitle");
  let popupText = document.getElementById("popupText");
  let okBtn = document.getElementById("popupOkBtn");

  popupTitle.innerText = title;
  popupText.innerText = message;
  document.getElementById("customPopup").style.display = "flex";

  // ✅ รีเซ็ตคลาสก่อน
  popupContent.classList.remove("success", "error");
  okBtn.classList.remove("success");

  // ✅ ถ้าเป็น "success" เปลี่ยนเป็นสีเขียว
  if (type === "success") {
      popupContent.classList.add("success");
      popupTitle.style.color = "#4CAF50"; // เปลี่ยนสีข้อความ
      okBtn.classList.add("success");
  } else {
      popupContent.classList.add("error");
      popupTitle.style.color = "#E53935"; // เปลี่ยนสีข้อความ
  }

  okBtn.onclick = function () {
      closePopup();
      if (callback) callback();
  };
}

function closePopup() {
  document.getElementById("customPopup").style.display = "none";
}