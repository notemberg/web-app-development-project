using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using MaJerGan.Data; // Replace 'YourProjectNamespace' with the actual namespace
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using MaJerGan.Models; // Add this line to include the namespace for the Message class


namespace MaJerGan.Controllers
{
    [Authorize]
    public class ChatController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ✅ ดึงข้อความของ Event
        // [HttpGet]
        // public async Task<IActionResult> GetMessages(int eventId)
        // {
        //     var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        //     if (userIdClaim == null) return Unauthorized();

        //     int userId = int.Parse(userIdClaim.Value);

        //     // ✅ ตรวจสอบว่าผู้ใช้เป็นสมาชิกของ Event นี้หรือไม่
        //     bool isParticipant = await _context.EventParticipants
        //         .AnyAsync(p => p.EventId == eventId && p.UserId == userId && p.Status == 1);

        //     if (!isParticipant)
        //     {
        //         return Forbid(); // ❌ ไม่อนุญาตให้ดูแชท
        //     }

        //     var messages = await _context.Messages
        //         .Where(m => m.EventId == eventId)
        //         .OrderBy(m => m.SentAt)
        //         .Select(m => new
        //         {
        //             UserName = m.User.Username,
        //             Content = m.Content,
        //             SentAt = m.SentAt.ToString("HH:mm:ss dd MMM yyyy")
        //         })
        //         .ToListAsync();

        //     return Ok(messages);
        // }

        // ✅ ส่งข้อความใหม่
        [HttpPost]
        public async Task<IActionResult> SendMessage(int eventId, string content)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            var message = new Message
            {
                EventId = eventId,
                UserId = userId,
                Content = content,
                SentAt = DateTime.Now
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }
}