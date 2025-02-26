using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace MaJerGan.Services
{
    public class EmailService
    {
        private readonly string _smtpServer = "smtp.gmail.com"; // ใช้ SMTP ของ Gmail หรือ Mail Server อื่น
        private readonly int _smtpPort = 587; // สำหรับ Gmail ใช้ 587
        private readonly string _emailFrom = "meet.me.sender@gmail.com"; // 📌 ใส่อีเมลของคุณ
        private readonly string _emailPassword = "lgcm huvy etzw uzoz"; // 📌 ใช้ App Password ถ้าเป็น Gmail

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                using (var client = new SmtpClient(_smtpServer, _smtpPort))
                {
                    client.Credentials = new NetworkCredential(_emailFrom, _emailPassword);
                    client.EnableSsl = true;

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(_emailFrom),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(toEmail);

                    await client.SendMailAsync(mailMessage);
                    Console.WriteLine($"📧 ส่งอีเมลแจ้งเตือนถึง {toEmail} สำเร็จ");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ส่งอีเมลล้มเหลว: {ex.Message}");
            }
        }
    }
}
