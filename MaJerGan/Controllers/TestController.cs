using MaJerGan.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using MaJerGan.Models; // ต้องมี using ให้เห็น EmailRequest

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

            foreach (var recipient in request.Recipients)
            {
                string subject;
                string body;

                switch (request.TemplateType?.ToLower())
                {
                    case "closed":
                        subject = "Your Event is closed";
                        // HTML + CSS แบบเรียบง่าย
                        body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.5;
            color: #333;
        }}
        .title {{
            color: #0072C6;
            font-size: 24px;
            margin-bottom: 10px;
        }}
        .content {{
            margin-bottom: 20px;
        }}
        .footer {{
            color: #888;
            font-size: 14px;
            margin-top: 30px;
        }}
    </style>
</head>
<body>
    <div class='content'>
        <div class='title'>สวัสดี คุณ {recipient.Username},</div>
        <p>{request.ActivityName} ได้ปิดรับสมาชิกแล้ว</p>
        <p>ซึ่งคุณจะมีนัดหมาย วันที่ {request.ActivityDate?.ToString("dd/MM/yyyy")} เวลา {request.ActivityTime}</p>
    </div>
    <div class='footer'>
        <p>เจอกันที่ {request.LocationName}</p>
    </div>
</body>
</html>
";
                        break;

                    case "updated":
                        subject = "Your Event got Updated!";
                        body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8' />
    <style>
        body {{
            font-family: Tahoma, sans-serif;
            margin: 20px;
            line-height: 1.5;
            color: #333;
        }}
        .title {{
            color: #28a745;
            font-size: 24px;
            margin-bottom: 10px;
        }}
        .content {{
            margin-bottom: 20px;
        }}
        .footer {{
            color: #888;
            font-size: 14px;
            margin-top: 30px;
        }}
    </style>
</head>
<body>
    <div class='content'>
        <div class='title'>สวัสดี คุณ {recipient.Username},</div>
        <p>{request.ActivityName} มีการอัพเดต โปรดตรวจสอบรายละเอียดเพิ่มเติม</p>
    </div>
    <div class='footer'>
        <p>Thank You</p>
    </div>
</body>
</html>
";
                        break;

                    default:
                        return BadRequest("TemplateType ไม่ถูกต้อง (ต้องเป็น 'closed' หรือ 'updated')");
                }

                // ส่งอีเมล (สมมุติ EmailService ตั้งให้ IsBodyHtml = true)
                await _emailService.SendEmailAsync(recipient.Email, subject, body);
            }

            return Ok("📨 ส่งอีเมลสำเร็จ!");
        }
    }
}
