document.addEventListener("DOMContentLoaded", function () {
    const notificationButton = document.getElementById("notificationButton");
    const notificationDropdown = document.getElementById("notificationDropdown");
    const markAllAsReadButton = document.getElementById("markAllAsRead");

    // ✅ ตรวจสอบว่า userId มีค่าหรือไม่
    if (!userId || userId === "null") {
        console.warn("❌ ผู้ใช้ยังไม่ได้เข้าสู่ระบบ, ไม่โหลด WebSocket และแจ้งเตือน");
        notificationButton.style.display = "none"; // ✅ ซ่อนปุ่มแจ้งเตือน
        return;
    }

    console.log(`✅ ใช้ userId: ${userId}`);

    // ✅ สร้าง WebSocket URL ตาม userId
    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const socketUrl = `${protocol}${window.location.host}/ws-notification?userId=${userId}`;
    const notificationSocket = new WebSocket(socketUrl);

    // ✅ เปิด/ปิดเมนูแจ้งเตือนเมื่อคลิกที่ปุ่ม 🔔
    notificationButton.addEventListener("click", function (event) {
        event.stopPropagation();
        notificationDropdown.classList.toggle("show");
    });

    // ✅ ซ่อนเมนูเมื่อคลิกข้างนอก
    document.addEventListener("click", function (event) {
        if (!notificationDropdown.contains(event.target) && !notificationButton.contains(event.target)) {
            notificationDropdown.classList.remove("show");
        }
    });

    // ✅ WebSocket Event Handlers
    notificationSocket.onopen = function () {
        console.log(`✅ WebSocket เชื่อมต่อสำเร็จสำหรับ User ${userId}`);
    };

    notificationSocket.onerror = function (error) {
        console.log(`❌ WebSocket Error: ${error}`);
    };

    notificationSocket.onclose = function () {
        console.log(`❌ WebSocket ถูกปิด`);
    };

    notificationSocket.onmessage = function (event) {
        console.log("🔔 Notification received: ", event.data);
        const notificationList = document.getElementById("notification-list");

        // สร้างแจ้งเตือนใหม่
        const notification = document.createElement("div");
        notification.classList.add("notification-item", "unread");
        notification.innerHTML = `<p>${event.data}</p>`;
        notificationList.prepend(notification);

        // อัปเดตตัวเลขแจ้งเตือน
        updateNotificationCount();
    };

    // ✅ โหลดแจ้งเตือนย้อนหลังจาก API
    fetch(`/api/notifications/user/${userId}`)
        .then(response => response.json())
        .then(data => {
            const notificationList = document.getElementById("notification-list");
            notificationList.innerHTML = "";
            data.forEach(noti => {
                const notification = document.createElement("div");
                notification.classList.add("notification-item");
                if (noti.status === "Unread") {
                    notification.classList.add("unread");
                }
                notification.innerHTML = `<p>${noti.message}</p>`;
                notificationList.appendChild(notification);
            });

            // อัปเดตตัวเลขแจ้งเตือน
            updateNotificationCount(data.length);
        })
        .catch(error => console.error("Error fetching notifications:", error));

    // ✅ ทำให้แจ้งเตือนทั้งหมดเป็น "อ่านแล้ว"
    markAllAsReadButton.addEventListener("click", function () {
        fetch(`/api/notifications/markAllAsRead/${userId}`, { method: "POST" })
            .then(() => {
                document.querySelectorAll(".notification-item.unread").forEach(item => {
                    item.classList.remove("unread");
                });
                updateNotificationCount(0);
            })
            .catch(error => console.error("Error marking all as read:", error));
    });

    // ✅ ฟังก์ชันอัปเดตจำนวนแจ้งเตือน
    function updateNotificationCount(count = null) {
        const badge = document.getElementById("notification-count");
        if (count === null) {
            count = document.querySelectorAll(".notification-item.unread").length;
        }
        badge.innerText = count;
        badge.style.display = count > 0 ? "block" : "none";
    }
});
