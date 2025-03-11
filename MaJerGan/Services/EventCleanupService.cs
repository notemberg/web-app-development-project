using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MaJerGan.Data;

namespace MaJerGan.Services
{
    public class EventCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly EmailService _emailService;

        public EventCleanupService(IServiceScopeFactory scopeFactory, EmailService emailService)
        {
            _scopeFactory = scopeFactory;
            _emailService = emailService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var now = DateTime.Now;
                    Console.WriteLine($"🔄 Background Service กำลังทำงานที่: {now}");

                    // หา Event ที่ควรปิด: หมดอายุ (ExpiryDate < now) หรือ EventTime < now และ IsClosed ยังเป็น false
                    var expiredEvents = await dbContext.Events
                        .Where(e =>
                            ((e.ExpiryDate < now) || (e.EventTime < now))
                            && !e.IsClosed
                        )
                        .ToListAsync();

                    Console.WriteLine($"📌 พบ {expiredEvents.Count} Event ที่ควรปิด");

                    if (expiredEvents.Any())
                    {
                        foreach (var evt in expiredEvents)
                        {
                            evt.IsClosed = true;
                            Console.WriteLine($"✅ ปิด Event ID: {evt.Id} {evt.Title}");

                            // ดึงผู้เข้าร่วมทุกคนของ Event
                            var participants = await dbContext.EventParticipants
                                .Include(p => p.User)
                                .Where(p => p.EventId == evt.Id)
                                .ToListAsync();

                            // ส่งอีเมลแจ้ง Closed ให้ทุก Participant
                            foreach (var participant in participants)
                            {
                                // subject/body แบบ HTML
                                var subject = "Your Event is Closed";
                                var body = $@"
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
        <div class='title'>สวัสดี คุณ({participant.User.Username}),</div>
        <p>กิจกรรม <b>{evt.Title}</b> ได้ปิดรับสมาชิกแล้ว</p>
        <p>วันที่ {evt.EventTime:dd/MM/yyyy} เวลา {evt.EventTime:HH:mm}</p>
    </div>
    <div class='footer'>
        <p>Meet Me Team</p>
    </div>
</body>
</html>";

                                // เรียก EmailService ส่งไปยังอีเมลของผู้ใช้แต่ละคน
                                await _emailService.SendEmailAsync(participant.User.Email, subject, body);
                                Console.WriteLine($"📧 ส่งอีเมลแจ้งเตือนถึง {participant.User.Email} สำเร็จ");
                            }
                        }

                        // บันทึกสถานะ IsClosed ลงใน DB
                        await dbContext.SaveChangesAsync();
                    }
                }

                // รอ 10 วินาที แล้วค่อยตรวจใหม่ (ปรับเป็น 5 นาทีหรืออย่างอื่นตามต้องการ)
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }
    }
}
