using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using MaJerGan.Repositories;

[Route("api/notifications")]
public class NotificationController : Controller
{
    private readonly NotificationRepository _notificationRepository;

    // ✅ Inject Repository เข้าไปใช้
    public NotificationController(NotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    // ✅ 1. ส่งแจ้งเตือน
    [HttpPost("send")]
    public async Task<IActionResult> SendNotification([FromBody] NotificationRequest request)
    {
        try
        {
            if (request.UserId <= 0)
            {
                return BadRequest(new { Error = "UserId ต้องมากกว่า 0" });
            }

            await _notificationRepository.AddNotification(
                request.UserId, request.EventId, request.Message, request.Type
            );
            return Ok(new { Message = "Notification sent successfully!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", Details = ex.Message });
        }
    }


    // ✅ 2. ดึงแจ้งเตือนของผู้ใช้
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserNotifications(int userId)
    {
        var notifications = await _notificationRepository.GetUserNotifications(userId);
        return Ok(notifications);
    }

    // ✅ 3. อัปเดตสถานะแจ้งเตือนเป็น "Read"
    [HttpPost("read/{notificationId}")]
    public async Task<IActionResult> MarkAsRead(int notificationId)
    {
        await _notificationRepository.MarkAsRead(notificationId);
        return Ok(new { Message = "Notification marked as read!" });
    }
}

public class NotificationRequest
{
    public int UserId { get; set; }
    public int? EventId { get; set; }
    public string Message { get; set; }
    public string Type { get; set; }
}
