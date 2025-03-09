using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using MaJerGan.Data;
using MaJerGan.Models;
using System.Text.RegularExpressions;
namespace MaJerGan.Services
{
    public class EventImageUpdateService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private static readonly HttpClient httpClient = new HttpClient();
        private const string ApiKey = "AIzaSyDJ0BrjaeMYo-Ib0n3r4RK1zO-u4v-XpBQ"; // 🔹 ใช้ API Key ของคุณ

        public EventImageUpdateService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("📸 Event Image Update Service is starting.");
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    Console.WriteLine($"🔄 [Image Update] กำลังอัปเดตรูปภาพ: {DateTime.Now}");

                    var events = await dbContext.Events
                        .Where(e => !string.IsNullOrEmpty(e.Location))
                        .ToListAsync();

                    foreach (var evt in events)
                    {
                        try
                        {
                            // 🔍 1. ค้นหา place_id จาก Location
                            string placeId = await GetPlaceIdFromLocation(evt.Location);
                            if (string.IsNullOrEmpty(placeId))
                            {
                                Console.WriteLine($"⚠️ ไม่พบ Place ID สำหรับสถานที่: {evt.Location}");
                                continue;
                            }

                            // 🖼️ 2. ดึง URL รูปภาพจาก place_id
                            string imageUrl = await GetPhotoUrlFromPlaceId(placeId);

                            if (!string.IsNullOrEmpty(imageUrl) && evt.LocationImage != imageUrl)
                            {
                                evt.LocationImage = imageUrl;
                                Console.WriteLine($"✅ อัปเดตรูปภาพ Event ID {evt.Id}: {imageUrl}");
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"❌ Error ใน Event ID {evt.Id}: {ex.Message}");
                        }
                    }

                    await dbContext.SaveChangesAsync();
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken); // รอ 24 ชั่วโมงก่อนอัปเดตใหม่
            }
        }

        // 📌 ค้นหา place_id จาก Location (ใช้ Google Places API)
        private async Task<string> GetPlaceIdFromLocation(string location)
        {
            // 📌 ถ้า Location เป็น URL Google Maps ให้ดึง place_id โดยตรง
            var match = Regex.Match(location, @"place_id:([\w-]+)");
            if (match.Success)
            {
                return match.Groups[1].Value;
            }

            // 📌 ถ้า Location ไม่ใช่ URL ให้ใช้ Google API ค้นหา
            string apiUrl = $"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input={Uri.EscapeDataString(location)}&inputtype=textquery&fields=place_id&key={ApiKey}";

            var response = await httpClient.GetAsync(apiUrl);
            string responseString = await response.Content.ReadAsStringAsync();
            var data = JsonConvert.DeserializeObject<FindPlaceResponse>(responseString);

            return data?.candidates?.FirstOrDefault()?.place_id ?? string.Empty;
        }

        // 📌 ดึง URL รูปภาพจาก place_id
        private async Task<string> GetPhotoUrlFromPlaceId(string placeId)
        {
            string apiUrl = $"https://maps.googleapis.com/maps/api/place/details/json?placeid={placeId}&fields=photos&key={ApiKey}";

            var response = await httpClient.GetAsync(apiUrl);
            string responseString = await response.Content.ReadAsStringAsync();
            var data = JsonConvert.DeserializeObject<GooglePlaceResponse>(responseString);

            if (data?.result?.photos != null && data.result.photos.Length > 0)
            {
                return $"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={data.result.photos[0].photo_reference}&key={ApiKey}";
            }

            return null; // ถ้าไม่มีรูป
        }
    }

    // 📌 JSON Model สำหรับ Google Places API
    public class FindPlaceResponse
    {
        public PlaceCandidate[] candidates { get; set; }
    }

    public class PlaceCandidate
    {
        public string place_id { get; set; }
    }

    public class GooglePlaceResponse
    {
        public PlaceResult result { get; set; }
    }

    public class PlaceResult
    {
        public PlacePhoto[] photos { get; set; }
    }

    public class PlacePhoto
    {
        public string photo_reference { get; set; }
    }
}
