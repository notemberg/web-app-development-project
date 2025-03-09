async function login() {
    let identifier = document.getElementById("identifier").value;
    let password = document.getElementById("password").value;
    let returnUrl = new URLSearchParams(window.location.search).get("ReturnUrl"); // ✅ ดึงค่า ReturnUrl

    if (!identifier || !password) {
        showPopup("เกิดข้อผิดพลาด", "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน", "error");
        return;
    }

    try {
        let response = await fetch(window.location.origin + "/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: identifier, password: password })
        });

        let result = await response.json();

        if (response.ok) {
        
            // window.location.href = "/home"; // ไปหน้าหลัก
            window.location.href = returnUrl || "/home";
        } else {
            showPopup(
                "เกิดข้อผิดพลาด",
                result.message || "ไม่สามารถเข้าสู่ระบบได้",
                "error"
            );
        }
    } catch (error) {
        console.error("Error:", error);
        showPopup(
            "เกิดข้อผิดพลาด",
            "เกิดปัญหาในการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดลองใหม่อีกครั้ง",
            "error"
        );
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
  