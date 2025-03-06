using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MaJerGan.Data;
using MaJerGan.Models;
using MaJerGan.Middleware;

namespace MaJerGan.Repositories
{
    public class NotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // ✅ 1. เพิ่ม Notification ใหม่ลงฐานข้อมูล
        public async Task AddNotification(int userId, int? eventId, string message, string type)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    EventId = eventId,
                    Message = message,
                    Type = type,
                    Status = "Unread"
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                Console.WriteLine($"✉️ New notification: {message}");
                await NotificationWebSocketHandler.SendNotificationToUser(userId, message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in AddNotification: {ex.InnerException?.Message ?? ex.Message}");
                throw; // ส่ง Error ออกไปให้ Controller ตรวจสอบ
            }
        }


        // ✅ 2. ดึงแจ้งเตือนทั้งหมดของผู้ใช้
        public async Task<List<Notification>> GetUserNotifications(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        // ✅ 1. ดึง Notification ตาม ID
        public async Task<Notification> GetNotificationById(int notificationId)
        {
            return await _context.Notifications.FindAsync(notificationId)!;
        }

        // ✅ 3. อัปเดตสถานะแจ้งเตือนเป็น "Read"
        public async Task MarkAsRead(int notificationId)
        {

            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.Status = "Read";

                await _context.SaveChangesAsync();
                await NotificationWebSocketHandler.sendUpdateReadNotification(notification.UserId);
            }
        }

        public async Task MarkAllAsRead(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && n.Status == "Unread")
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.Status = "Read";
            }

            

            await _context.SaveChangesAsync();

            await NotificationWebSocketHandler.sendUpdateReadNotification(userId);
        }


    }
}
