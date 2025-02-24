using MaJerGan.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MaJerGan.Controllers
{
    [Route("api/test")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly EmailService _emailService;

        public TestController(EmailService emailService)
        {
            _emailService = emailService;
        }

        // 🔹 ทดสอบส่งอีเมล
        [HttpGet("send-email")]
        public async Task<IActionResult> SendTestEmail()
        {
            string testEmail = "aot123321ann@gmail.com"; // ✅ เปลี่ยนเป็นอีเมลที่ต้องการเทส
            string subject = "📧 ทดสอบระบบส่งอีเมล";
            string body = "<p>สวัสดีค่ะ,</p><p>นี่เป็นการทดสอบระบบส่งอีเมลจาก MaJerGan.</p>";

            await _emailService.SendEmailAsync(testEmail, subject, body);
            return Ok("📨 ส่งอีเมลสำเร็จ!");
        }
    }
}
