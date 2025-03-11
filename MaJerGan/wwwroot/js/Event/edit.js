document.addEventListener("DOMContentLoaded", function () {
  async function closeEvent(eventId) {
    try {
      // ส่งคำขอ POST ผ่าน URL โดยใช้ fetch
      const response = await fetch(`/Event/CloseEvent/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ไม่ต้องใช้ body ในกรณีนี้
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        window.location.reload(); // รีเฟรชหน้าเพื่อแสดงการเปลี่ยนแปลง
      } else {
        alert("เกิดข้อผิดพลาดในการปิดกิจกรรม");
      }
    } catch (error) {
      console.error("Error closing event:", error);
      alert("เกิดข้อผิดพลาดในการปิดกิจกรรม");
    }
  }

  // เรียกใช้ฟังก์ชันปิดกิจกรรมเมื่อคลิกปุ่ม
  document
    .getElementById("end-registration-btn")
    .addEventListener("click", function () {
      const urlPath = window.location.pathname;
      const eventId = urlPath.split("/").pop(); // แยกตาม '/' แล้วดึงค่าล่าสุด (eventId)
      closeEvent(eventId); // เรียกฟังก์ชันปิดกิจกรรม
    });
});
