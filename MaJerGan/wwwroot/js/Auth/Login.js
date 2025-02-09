async function login() {
    let identifier = document.getElementById("identifier").value;
    let password = document.getElementById("password").value;

    if (!identifier || !password) {
        alert("กรุณากรอก Username หรือ Email และรหัสผ่าน");
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
            alert("เข้าสู่ระบบสำเร็จ!");
            window.location.href = "/home"; // ไปหน้าหลัก
        } else {
            alert("เกิดข้อผิดพลาด: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
}
