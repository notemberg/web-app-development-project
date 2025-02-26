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

        public EventCleanupService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
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

                    var expiredEvents = await dbContext.Events
                        .Where(e => e.ExpiryDate  < now && !e.IsClosed)
                        .ToListAsync();

                    Console.WriteLine($"📌 พบ {expiredEvents.Count} Event ที่ควรปิด");

                    if (expiredEvents.Any())
                    {
                        foreach (var evt in expiredEvents)
                        {
                            evt.IsClosed = true;
                            Console.WriteLine($"✅ ปิด Event ID: {evt.Id}");
                        }
                        await dbContext.SaveChangesAsync();
                    }
                }

                // await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                // await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

    }
}
