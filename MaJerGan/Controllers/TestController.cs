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
            string testEmail = "66010794@kmitl.ac.th"; // ✅ เปลี่ยนเป็นอีเมลที่ต้องการเทส
            string subject = "📧 ทดสอบระบบส่งอีเมล";
            string body = $@"
<!DOCTYPE html>
<html lang='th'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Post Updated Notification</title>

    <!-- ✅ เชื่อมต่อ Google Fonts -->
    <link rel='preconnect' href='https://fonts.googleapis.com'>
    <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>
    <link href='https://fonts.googleapis.com/css2?family=Suez+One&display=swap' rel='stylesheet'>
    <link href='https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600&display=swap' rel='stylesheet'>

    <style>
        body {{
            font-family: 'IBM Plex Sans Thai Looped', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            flex-direction: column;
        }}

        .main-container {{
            width: 90%;
            max-width: 1200px; 
            background: linear-gradient(to top left, #A8E6CF, #FFD3B6, #FFAAA5); 
            padding: 30px 0;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            position: relative; /* ✅ ให้เป็น relative เพื่อให้ .logo อ้างอิง */
        }}

        /* ✅ ปรับให้โลโก้อยู่ตรงกลางด้านบนของ email-container */
        .logo {{
            font-size: 24px;
            color: #ffffff;
            font-family: 'Suez One', serif;
            font-weight: 400;
            padding-left: 100px;
            margin-bottom: 50px;
            width: 100%;
            text-align: left;
        }}

        .email-container {{
            background: #FFF6F5;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 60%;
            text-align: left;
            display: flex;
            flex-direction: column;
            aspect-ratio: 1 / 1; /* ✅ ทำให้เป็นจัตุรัส (กว้าง = สูง) */
        }}

        h1 {{
            color: #333;
            font-size: 24px;
            font-weight: 600; /* ใช้ฟอนต์ Semibold */
            text-align: center;
        }}

        p {{
            color: #3d3d3d;
            font-size: 16px;
            line-height: 1.6;
            font-weight: 400; /* ใช้ฟอนต์ Regular */
        }}

        /* ✅ Footer อยู่ตรงกลางและด้านล่าง */
        .footer {{
            width: 100%;
            font-size: 12px;
            color: #ffffff;
            text-align: center;
            padding-top: 20px;
        }}

        @media (max-width: 768px) {{
            .main-container {{
                width: 100%;
                padding: 30px 0;
            }}

            .email-container {{
                padding: 20px;
            }}

            .logo {{
                font-size: 18px; /* ลดขนาดโลโก้ */
                padding-left: 15px; /* ปรับระยะจากขอบซ้าย */
            }}
        }}

        @media (max-width: 480px) {{
            .logo {{
                font-size: 16px; /* ลดขนาดโลโก้ให้อ่านง่าย */
                padding-left: 10px; /* ปรับระยะจากขอบซ้ายให้เหมาะสม */
            }}
        }}
    </style>
</head>
<body>
    <div class='main-container'>
        <h2 class='logo'>Meet ME!</h2>
        <div class='email-container'>
            <h1>📢  got Updated!</h1>
            <p>สวัสดีค่ะ คุณ ,</p>
            <p>โพสต์  ได้รับการอัปเดตแล้ว!</p>
        </div>
        <p class='footer'>©MeetMe</p>
    </div>
</body>
</html>";



            await _emailService.SendEmailAsync(testEmail, subject, body);
            return Ok("📨 ส่งอีเมลสำเร็จ!");
        }
    }
}
