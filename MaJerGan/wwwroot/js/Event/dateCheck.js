document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.getElementById("event-date");
    const timeInput = document.getElementById("event-time");
    const expiryDateInput = document.getElementById("expiry-date");

    // ห้ามเลือกวันย้อนหลัง (วันเริ่มต้นต้องเป็นวันปัจจุบันหรืออนาคต)
    const today = new Date().toISOString().split("T")[0];

    const expiryStartDate = new Date();
    const formattedMinDate = expiryStartDate.toISOString().split("T")[0] + "T00:00"; // ตั้งให้เริ่มโพสต์ได้ตั้งแต่ 00:00 ของวันนี้

    dateInput.setAttribute("min", today);
    expiryDateInput.setAttribute("min", today); // ✅ ป้องกัน Expiry Date ที่ย้อนหลังวันนี้

    function validateDates() {
        // const startDate = new Date(dateInput.value);
        const startDate = new Date(dateInput.value + "T" + timeInput.value + ":00");
        const expiryDate = new Date(expiryDateInput.value);
        console.log("Start Date:", startDate);
        console.log("Expiry Date:", expiryDate);
        if (expiryDate >= startDate) {
            alert("Registration End Date must be before the Event Date.");
            expiryDateInput.value = ""; // รีเซ็ตค่าเพื่อให้ผู้ใช้เลือกใหม่
        }
    }

    // อัปเดต max และ min ของ Expiry Date ทุกครั้งที่เปลี่ยน Event Start Date
    dateInput.addEventListener("change", function () {
        if (dateInput.value) {
            const selectedDate = new Date(dateInput.value);
            selectedDate.setDate(selectedDate.getDate()); // ❗ ลดลง 1 วัน
            const formattedMaxDate = selectedDate.toISOString().split("T")[0] + "T23:59"; // ตั้งให้ปิดโพสต์ได้ถึง 23:59 ของวันก่อนหน้า

            console.log("Max Expiry Date:", formattedMaxDate);
            expiryDateInput.setAttribute("max", formattedMaxDate);
            expiryDateInput.setAttribute("min", formattedMinDate); // ✅ ป้องกัน Expiry Date ที่ย้อนหลังวันเริ่มต้น
        }

        expiryDateInput.value = ""; // รีเซ็ตค่าเพื่อให้ผู้ใช้เลือกใหม่
    });

    expiryDateInput.addEventListener("change", validateDates);
    console.log("Date check loaded");
});
