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
    console.log("📩 ได้รับข้อความ WebSocket:", event.data);
    fetchNotifications();
    updateNotificationCount();
  };

  // function fetchNotifications() {
  //   fetch(`/api/notifications/user/${userId}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       notificationList.innerHTML = ""; // ล้างรายการแจ้งเตือนเก่า
  //       data.forEach((noti) => {
  //         const notification = document.createElement("div");
  //         notification.classList.add("notification-item");
  //         notification.setAttribute("data-id", noti.id);
  //         if (noti.status === "Unread") {
  //           notification.classList.add("unread");
  //         }
  //         notification.innerHTML = `<p>${noti.message}</p>`;
  //         notification.style.cursor = "pointer";
  //         notification.addEventListener("click", function () {
  //           markNotificationAsRead(noti.id);
  //         });

  //         notificationList.appendChild(notification);
  //       });

  //       updateNotificationCount(data.length);
  //     })
  //     .catch((error) =>
  //       console.error("❌ Error fetching notifications:", error)
  //     );
  // }

  // function fetchNotifications() {
  //   fetch(`/api/notifications/user/${userId}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       const notificationList = document.getElementById("notification-list");
  //       notificationList.innerHTML = ""; // ล้างรายการแจ้งเตือนเก่า

  //       data.forEach((noti) => {
  //         const notification = document.createElement("div");
  //         notification.classList.add("notification-item");
  //         notification.setAttribute("data-id", noti.id);

  //         if (noti.status === "Unread") {
  //           notification.classList.add("unread");
  //         }

  //         // ✅ กำหนดไอคอนแจ้งเตือนตามประเภท
  //         let iconHtml = "";
  //         if (noti.type === "JoinRequest") {
  //           iconHtml = `<img src="/icons/join-request.png" class="notification-icon" alt="Join Request">`;
  //         } else if (noti.type === "PostUpdate") {
  //           iconHtml = `<img src="/icons/post-update.png" class="notification-icon" alt="Post Update">`;
  //         } else if (noti.type === "JoinConfirmation") {
  //           iconHtml = `<i class="fa-sharp fa-solid fa-circle-check" style="color: #63E6BE;"></i>`;
  //         } else if (noti.type === "JoinRejection") {
  //           iconHtml = `<i class="fa-regular fa-circle-xmark" style="color: #ff0000;"></i>`;
  //         } else if (noti.type === "SendJoinRequest") {
  //           iconHtml = `<i class="fa-regular fa-paper-plane" style="color: #63E6BE;"></i>`;
  //         } else if (noti.type === "GetJoinRequest") {
  //           iconHtml = `<i class="fa-regular fa-envelope" style="color: #63E6BE;"></i>`;
  //         } else {
  //           iconHtml = `<i class="fa-regular fa-circle-exclamation" style="color: #FFD43B;"></i>`;
  //         }

  //         // ✅ ปุ่มเพิ่มเติม ถ้าเป็นคำขอเข้าร่วม (Accept / Decline)
  //         let actionButtons = "";
  //         if (noti.type === "JoinRequest") {
  //           actionButtons = `
  //                       <button class="btn-accept" onclick="handleJoinRequest(${noti.id}, true)">Accept</button>
  //                       <button class="btn-decline" onclick="handleJoinRequest(${noti.id}, false)">Decline</button>
  //                   `;
  //         } else {
  //           actionButtons = `<button class="btn-detail" onclick="redirectToDetail(${noti.id})">Check the Detail</button>`;

  //         }

  //         // ✅ ใส่ข้อมูลการแจ้งเตือนให้เหมือน UI ที่ส่งมา
  //         notification.innerHTML = `
  //                   <div class="notification-content">
  //                       ${iconHtml}
  //                       <p class="notification-time">${formatNotificationTime(
  //                             noti.createdAt
  //                           )}</p>
  //                       <div class="notification-text">
  //                           <p class="notification-message">${noti.message}</p>

  //                       </div>
  //                   </div>
  //                   <div class="notification-actions">
  //                       ${actionButtons}
  //                   </div>
  //               `;

  //         notificationList.appendChild(notification);
  //       });

  //       updateNotificationCount(data.length);
  //     })
  //     .catch((error) =>
  //       console.error("❌ Error fetching notifications:", error)
  //     );
  // }

  function fetchNotifications() {
    fetch(`/api/notifications/user/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        const notificationList = document.getElementById("notification-list");
        notificationList.innerHTML = ""; // ล้างรายการแจ้งเตือนเก่า

        data.forEach((noti) => {
          const notification = document.createElement("div");
          notification.classList.add("notification-item");
          notification.setAttribute("data-id", noti.id);

          if (noti.status === "Unread") {
            notification.classList.add("unread");
          }

          // ✅ กำหนดไอคอนแจ้งเตือนตามประเภท
          let iconHtml = "";
          if (noti.type === "JoinRequest") {
            iconHtml = `<img src="/icons/join-request.png" class="notification-icon" alt="Join Request">`;
          } else if (noti.type === "PostUpdate") {
            iconHtml = `<img src="/icons/post-update.png" class="notification-icon" alt="Post Update">`;
          } else if (noti.type === "JoinConfirmation") {
            iconHtml = `<i class="fa-sharp fa-solid fa-circle-check" style="color: #63E6BE;"></i>`;
          } else if (noti.type === "JoinRejection") {
            iconHtml = `<i class="fa-regular fa-circle-xmark" style="color: #ff0000;"></i>`;
          } else if (noti.type === "SendJoinRequest") {
            iconHtml = `<i class="fa-regular fa-paper-plane" style="color: #63E6BE;"></i>`;
          } else if (noti.type === "GetJoinRequest") {
            iconHtml = `<i class="fa-regular fa-envelope" style="color: #63E6BE;"></i>`;
          } else {
            iconHtml = `<i class="fa-regular fa-circle-exclamation" style="color: #FFD43B;"></i>`;
          }

          // ✅ ปุ่มเพิ่มเติม ถ้าเป็นคำขอเข้าร่วม (Accept / Decline)
          let actionButtons = document.createElement("div");
          actionButtons.classList.add("notification-actions");

          if (noti.type === "GetJoinRequest2") {
            const acceptButton = document.createElement("button");
            acceptButton.classList.add("btn-accept");
            acceptButton.innerText = "Accept";
            acceptButton.addEventListener("click", function () {
              handleJoinRequest(noti.eventId, noti.receiverId, noti.id, true);
            });

            const declineButton = document.createElement("button");
            declineButton.classList.add("btn-decline");
            declineButton.innerText = "Decline";
            declineButton.addEventListener("click", function () {
              handleJoinRequest(noti.eventId, noti.receiverId, noti.id, false);
            });

            actionButtons.appendChild(acceptButton);
            actionButtons.appendChild(declineButton);
          } else {
            const detailButton = document.createElement("button");
            detailButton.classList.add("btn-detail");
            detailButton.innerText = "Check the Detail";
            detailButton.addEventListener("click", function () {
              redirectToDetail(noti.id, noti.eventId);
            });

            actionButtons.appendChild(detailButton);
          }

          // ✅ ใส่ข้อมูลการแจ้งเตือนให้เหมือน UI ที่ส่งมา
          notification.innerHTML = `
                    <div class="notification-content">
                        ${iconHtml}
                        <p class="notification-time">${formatNotificationTime(
                          noti.createdAt
                        )}</p>
                        <div class="notification-text">
                            <p class="notification-message">${noti.message}</p>
                        </div>
                    </div>
                `;

          notification.appendChild(actionButtons);
          notification.addEventListener("click", function () {
            markNotificationAsRead(noti.id);
          });
          notificationList.appendChild(notification);
        });

        updateNotificationCount(data.length);
      })
      .catch((error) =>
        console.error("❌ Error fetching notifications:", error)
      );
  }

  // ✅ ฟังก์ชันแปลงเวลาให้อ่านง่าย
  function formatNotificationTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ✅ ฟังก์ชันนำทางไปยังหน้ารายละเอียด
  function redirectToDetail(notificationId, eventId) {
    markNotificationAsRead(notificationId);
    window.location.href = `/Event/Details/${eventId}`;
  }

  // ✅ ฟังก์ชันจัดการคำขอเข้าร่วม (Accept / Decline)
  function handleJoinRequest(eventId, receiverId, notificationId, isAccepted) {
    if (isAccepted) {
      fetch(`/event/approve?eventId=${eventId}&userId=${receiverId}`, {
        method: "POST",
      })
        .then(() => {
          markNotificationAsRead(notificationId);
          fetchNotifications();
        })
        .catch((error) =>
          console.error("❌ Error accepting join request:", error)
        );
    } else {
      fetch(`/event/Reject?eventId=${eventId}&userId=${receiverId}`, {
        method: "POST",
      })
        .then(() => {
          markNotificationAsRead(notificationId);
          fetchNotifications();
        })
        .catch((error) =>
          console.error("❌ Error declining join request:", error)
        );
    }
  }

  markAllAsReadButton.addEventListener("click", function () {
    fetch(`/api/notifications/markAllAsRead`, { method: "POST" })
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
    if (unreadCount > 100) {
      badge.innerText = "99+";
    } else {
      badge.innerText = unreadCount;
    }
    badge.style.display = unreadCount > 0 ? "block" : "none";
  }
  fetchNotifications();
});
