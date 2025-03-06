document.addEventListener("DOMContentLoaded", function () {
  const notificationButton = document.getElementById("notificationButton");
  const notificationDropdown = document.getElementById("notificationDropdown");
  const markAllAsReadButton = document.getElementById("markAllAsRead");

  const notificationList = document.getElementById("notification-list");
  const notificationCount = document.getElementById("notification-count");

  if (!userId || userId === "null") {
    console.warn(
      "❌ ผู้ใช้ยังไม่ได้เข้าสู่ระบบ, ไม่โหลด WebSocket และแจ้งเตือน"
    );
    notificationButton.style.display = "none";
    return;
  }

  console.log(`✅ ใช้ userId: ${userId}`);

  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const socketUrl = `${protocol}${window.location.host}/ws-notification?userId=${userId}`;
  const notificationSocket = new WebSocket(socketUrl);

  notificationButton.addEventListener("click", function (event) {
    event.stopPropagation();
    notificationDropdown.classList.toggle("show");
  });

  document.addEventListener("click", function (event) {
    if (
      !notificationDropdown.contains(event.target) &&
      !notificationButton.contains(event.target)
    ) {
      notificationDropdown.classList.remove("show");
    }
  });

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
    fetchNotifications();
  };

  function fetchNotifications() {
    fetch(`/api/notifications/user/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        notificationList.innerHTML = ""; // ล้างรายการแจ้งเตือนเก่า
        data.forEach((noti) => {
          const notification = document.createElement("div");
          notification.classList.add("notification-item");
          notification.setAttribute("data-id", noti.id);
          if (noti.status === "Unread") {
            notification.classList.add("unread");
          }
          notification.innerHTML = `<p>${noti.message}</p>`;
          notification.style.cursor = "pointer";
          notification.addEventListener("click", function () {
            markNotificationAsRead(noti.id);
          });

          notificationList.appendChild(notification);
        });

        updateNotificationCount(data.length);
      })
      .catch((error) => console.error("❌ Error fetching notifications:", error));
  }

  markAllAsReadButton.addEventListener("click", function () {
    fetch(`/api/notifications/markAllAsRead/${userId}`, { method: "POST" })
      .then(() => {
        document
          .querySelectorAll(".notification-item.unread")
          .forEach((item) => {
            item.classList.remove("unread");
          });
        updateNotificationCount(0);
      })
      .catch((error) => console.error("Error marking all as read:", error));
  });

  function markNotificationAsRead(notificationId) {
    fetch(`/api/notifications/read/${notificationId}`, { method: "POST" })
      .then(() => {
        document
          .querySelector(`.notification-item[data-id='${notificationId}']`)
          ?.classList.remove("unread");
        updateNotificationCount();
      })
      .catch((error) =>
        console.error("Error marking notification as read:", error)
      );
  }

  function updateNotificationCount() {
    const badge = document.getElementById("notification-count");
    const unreadCount = document.querySelectorAll(
      ".notification-item.unread"
    ).length;
    if (unreadCount > 100){
        badge.innerText = "99+";
    }
    else{
        badge.innerText = unreadCount;
    }
    badge.style.display = unreadCount > 0 ? "block" : "none";
  }
  fetchNotifications();
});
