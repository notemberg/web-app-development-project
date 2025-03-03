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

function togglePassword(inputId,icon) {
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

}

function saveProfile() {
    var updatedData = {
        Username: document.getElementById("username").value,
        Email: document.getElementById("email").value,
        Phone: document.getElementById("phone").value
    };

    console.log("Sending Data:",updatedData);

    $.ajax({
        url: "/Profile/Update",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(updatedData),
        success: function (response) {
            console.log("Response:",response);
            if (response.success) {
                alert(response.message);
                location.reload(); // รีโหลดหน้าเพื่อกลับไปสถานะแรก
            } else {
                alert("Failed: " + response.message);
            }
        },
        error: function (xhr,status,error) {
            console.error("AJAX Error:",error);
            alert("Error updating profile.");
        }
    });
}

function changePassword() {
    var currentPassword = document.getElementById("currentPassword").value;
    var newPassword = document.getElementById("newPassword").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
        alert("Password not match.");
        return;
    }

    var data = {
        CurrentPassword: currentPassword,
        NewPassword: newPassword
    };

    $.ajax({
        url: "/Profile/ChangePassword",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                alert(response.message);
                closeModal();
            } else {
                alert("Failed: " + response.message);
            }
        },
        error: function (xhr,status,error) {
            console.error("AJAX Error:",error);
            alert("Error changing password.");
        }
    });
}

function uploadImage() {
    document.getElementById("imageUpload").click();
}

//document.getElementById("imageUpload").addEventListener("change",function (event) {
//    var reader = new FileReader();
//    reader.onload = function () {
//        document.getElementById("profileImg").src = reader.result;
//    };
//    reader.readAsDataURL(event.target.files[0]);
//});


async function submitChangePassword() {
    let userId = document.getElementById("userId").value;
    let oldPassword = document.getElementById("password").value;
    let newPassword = document.getElementById("new-password").value;
    let confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
        alert("New passwords do not match!");
        return;
    }

    let requestData = {
        userId: userId,
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword
    };

    try {
        let response = await fetch("/profile/changepassword",{  // ✅ เปลี่ยนเส้นทางให้ตรงกับ API
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector('input[name="__RequestVerificationToken"]')?.value || ""
            },
            body: JSON.stringify(requestData)
        });

        let result = await response.json();
        if (result.success) {
            alert("✅ " + result.message);

            closeModal();
        } else {
            alert("❌ " + result.message);
        }
    } catch (error) {
        console.error("Error:",error);
        alert("❌ Failed to change password.");
    }
}