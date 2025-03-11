using MaJerGan.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using MaJerGan.Models; // ให้ชัวร์ว่ากำลังใช้ EmailRequest ตัวใหม่

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

        // POST: api/test/send-emails
        [HttpPost("send-emails")]
        public async Task<IActionResult> SendEmails([FromBody] EmailRequest request)
        {
            if (request == null ||
                request.Recipients == null ||
                request.Recipients.Count == 0)
            {
                return BadRequest("ข้อมูลไม่ครบหรือไม่มี Recipients");
            }

            // วนลูปส่งให้ Recipient แต่ละตัว
            foreach (var recipient in request.Recipients)
            {
                string subject = string.Empty;
                string body = string.Empty;

                // เลือกเทมเพลตตาม request.TemplateType
                switch (request.TemplateType?.ToLower())
                {
                    case "closed":
                        subject = $"{request.ActivityName} is closed";
                        body = $@"สวัสดี คุณ({recipient.Username}),

รายละเอียด:
{request.ActivityName} ได้ปิดรับสมาชิกแล้ว 
วันที่ {request.ActivityDate?.ToString("dd/MM/yyyy")} เวลา {request.ActivityTime}

Meet Me Team
";
                        break;

                    case "updated":
                        subject = $"{request.ActivityName} got Updated!";
                        body = $@"สวัสดี คุณ({recipient.Username}),

รายละเอียด:
{request.ActivityName} มีการอัพเดต โปรดตรวจสอบรายละเอียดเพิ่มเติม

Meet Me Team
";
                        break;

                    default:
                        // หาก templateType ไม่ตรงกับ "closed" หรือ "updated"
                        return BadRequest("TemplateType ไม่ถูกต้อง (ต้องเป็น 'closed' หรือ 'updated')");
                }

                // ส่งอีเมลไปยัง recipient.Email
                await _emailService.SendEmailAsync(recipient.Email, subject, body);
            }

            return Ok("📨 ส่งอีเมลสำเร็จ!");
        }
    }
}