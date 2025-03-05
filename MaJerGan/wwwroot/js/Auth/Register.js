async function validateForm2() {
  let username = document.getElementById("username").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value;
  let confirmPassword = document.getElementById("confirm-password").value;
  let phone = document.getElementById("phone").value.trim();
  let dateofbirth = document.getElementById("dateofbirth").value;
  let gender = document.getElementById("gender").value;

  // ✅ ตรวจสอบว่าข้อมูลครบถ้วน
  if (
    !username ||
    !email ||
    !password ||
    !confirmPassword ||
    !dateofbirth ||
    !gender
  ) {
    showPopup("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบทุกช่อง!", "error");
    return;
  }

  // if(!/^[a-zA-Z0-9]{,12}$/.test(username)) {
  //   showPopup("ข้อผิดพลาด", "ชื่อผู้ใช้ต้องมีความยาวไม่เกิน 12 ตัวอักษร และสามารถใช้ตัวอักษร a-z, A-Z และตัวเลข 0-9 เท่านั้น", "error");
  //   return;
  // }

  // ✅ ตรวจสอบว่ารหัสผ่านตรงกัน
  if (password !== confirmPassword) {
    showPopup("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน! โปรดตรวจสอบอีกครั้ง", "error");
    return;
  }

  try {
    let response = await fetch(window.location.origin + "/api/check-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        phone: phone || null,
        dateofbirth: dateofbirth,
        gender: gender,
      }),
    });

    let result = await response.json();

    if (response.ok) {
      // ✅ เก็บข้อมูลผู้ใช้ไว้ใน localStorage เพื่อใช้ต่อในหน้า Interests
      let userData = {
        username: username,
        email: email,
        password: password,
        phone: phone || null,
        dateofbirth: dateofbirth,
        gender: gender,
      };

      localStorage.setItem("userData", JSON.stringify(userData));

      // ✅ เปลี่ยนเส้นทางไปหน้า Interests
      window.location.href = "interests";
    } else {
      showPopup(
        "เกิดข้อผิดพลาด",
        result.message || "ไม่สามารถสมัครสมาชิกได้",
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
