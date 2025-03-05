using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MaJerGan.Data;
using MaJerGan.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using MaJerGan.Middleware;
using System.Net.Http;
using Newtonsoft.Json.Linq;

namespace MaJerGan.Controllers
{
    public class EventController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly string _googleMapsApiKey = "AIzaSyDJ0BrjaeMYo-Ib0n3r4RK1zO-u4v-XpBQ";  // ใส่ API Key ของคุณที่นี่
        public EventController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize]  // ให้เฉพาะผู้ที่ Login เท่านั้นที่สร้างกิจกรรมได้
        public IActionResult Create()
        {
            return View();
        }

        [Authorize]
        public async Task<IActionResult> Index()
        {
            var events = await _context.Events
            .Include(e => e.Creator) // ✅ ดึงข้อมูลผู้สร้าง
            .Include(e => e.Participants) // ✅ ดึงข้อมูลผู้เข้าร่วม
            .ToListAsync();
            return View(events);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Event model, string selectedTags)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(); // ถ้าไม่มี User ID ให้ปฏิเสธการสร้างกิจกรรม
            }

            int userId = int.Parse(userIdClaim.Value);
            model.CreatedBy = userId;

            Console.WriteLine(model.AllowedGenders);
            // ✅ บันทึก Event ก่อน เพื่อให้ model.Id ถูกสร้าง
            _context.Events.Add(model);
            await _context.SaveChangesAsync(); // ✅ ใช้ `await` เพื่อให้แน่ใจว่า `model.Id` ถูกสร้าง

            // ✅ เพิ่มแท็กลงใน EventTags
            if (!string.IsNullOrEmpty(selectedTags))
            {
                var tagNames = selectedTags.Split(',').Select(t => t.Trim()).ToList();
                foreach (var tagName in tagNames)
                {
                    var tag = _context.Tags.FirstOrDefault(t => t.Name == tagName);
                    if (tag == null)
                    {
                        tag = new Tag { Name = tagName };
                        _context.Tags.Add(tag);
                        await _context.SaveChangesAsync();
                    }

                    _context.EventTags.Add(new EventTag { EventId = model.Id, TagId = tag.Id });
                }
                await _context.SaveChangesAsync(); // ✅ บันทึก EventTags
            }

            // ✅ อัปเดต `Tags` หลังจากบันทึก `EventTags` แล้ว
            model.Tags = string.Join(", ", _context.EventTags
                .Where(et => et.EventId == model.Id)
                .Select(et => et.Tag.Name)
                .ToList());

            _context.Events.Update(model); // ✅ บอกให้ EF อัปเดต `Tags` ในฐานข้อมูล
            await _context.SaveChangesAsync(); // ✅ บันทึกการอัปเดต `Tags`

            await WebSocketHandler.BroadcastMessage("New Event Added!");

            return RedirectToAction("Index");
        }



        [HttpGet]
        [Route("Event/Details/{id}")]
        public async Task<IActionResult> Details(int id)
        {
            var eventDetails = await _context.Events
        .Include(e => e.Creator) // ดึงข้อมูลผู้สร้างกิจกรรม
        .Include(e => e.Participants)
        .ThenInclude(p => p.User) // ดึงข้อมูลของ User ที่เข้าร่วม
        .FirstOrDefaultAsync(e => e.Id == id);
            if (eventDetails == null)
            {
                return NotFound();
            }
            // ✅ เพิ่มจำนวนเข้าชม

            eventDetails.ViewCount++;
            _context.Events.Update(eventDetails);
            await _context.SaveChangesAsync();
            return View(eventDetails);
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            var eventToDelete = await _context.Events.FindAsync(id);
            if (eventToDelete == null)
            {
                return NotFound();
            }

            _context.Events.Remove(eventToDelete);
            await _context.SaveChangesAsync();

            await WebSocketHandler.BroadcastMessage("Event Deleted!");
            return RedirectToAction("Index");
        }

        [Authorize]
        [HttpPost]
        // public async Task<IActionResult> Join(int eventId)
        // {
        //     var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        //     if (userIdClaim == null)
        //     {
        //         return Unauthorized();
        //     }

        //     int userId = int.Parse(userIdClaim.Value);

        //     var existingParticipation = await _context.EventParticipants
        //         .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);

        //     if (existingParticipation != null)
        //     {
        //         return BadRequest("คุณได้เข้าร่วมกิจกรรมนี้แล้ว");
        //     }

        //     var participation = new EventParticipant
        //     {
        //         EventId = eventId,
        //         UserId = userId,
        //         // Status = 1 // ✅ อนุมัติอัตโนมัติ
        //     };

        //     _context.EventParticipants.Add(participation);
        //     await _context.SaveChangesAsync();

        //     await WebSocketHandler.BroadcastMessage("Event Joined!");

        //     return RedirectToAction("Details", new { id = eventId });
        // }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Join(int eventId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim.Value);

            var existingParticipation = await _context.EventParticipants
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);

            if (existingParticipation != null)
            {
                if (existingParticipation.Status == ParticipationStatus.Rejected)
                {
                    return BadRequest("คุณถูกปฏิเสธจากกิจกรรมนี้แล้ว: " + existingParticipation.RejectedReason);
                }
                return BadRequest("คุณได้เข้าร่วมกิจกรรมนี้แล้ว");
            }

            var eventDetails = await _context.Events.FindAsync(eventId);
            if (eventDetails == null)
            {
                return NotFound("ไม่พบกิจกรรมนี้");
            }
            
            Console.WriteLine($"🔍 Event RequiresConfirmation: {eventDetails.RequiresConfirmation}");
            var participation = new EventParticipant
            {
                EventId = eventId,
                UserId = userId,
                Status = eventDetails.RequiresConfirmation ? ParticipationStatus.Pending : ParticipationStatus.Approved
            };

            _context.EventParticipants.Add(participation);
            await _context.SaveChangesAsync();

            await WebSocketHandler.BroadcastMessage($"User {userId} joined event {eventId}");

            return RedirectToAction("Details", new { id = eventId });
        }


        [HttpGet]
        public async Task<IActionResult> GetHotEvents()
        {
            DateTime today = DateTime.UtcNow;

            var hotEvents = await _context.Events
                .Where(e => e.ExpiryDate >= today && !e.IsClosed) // ✅ เพิ่มเงื่อนไขให้ดึงเฉพาะกิจกรรมที่ยังเปิดอยู่
                .OrderByDescending(e => e.ViewCount) // ✅ เรียงลำดับจากยอดวิวสูงสุด
                .Take(5) // ✅ เอาแค่ 5 อันดับแรก
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.Tags,
                    e.ViewCount,
                    e.MaxParticipants,
                    e.Location,
                    CurrentParticipants = e.Participants != null ? e.Participants.Count(p => p.Status == ParticipationStatus.Approved) : 0,
                    creator = e.Creator.Username // ✅ เพิ่มชื่อผู้สร้าง
                })
                .ToListAsync();

            return Json(hotEvents);
        }



        [HttpGet]
        public async Task<IActionResult> GetRecentEvents(string orderBy = "desc")
        {
            bool isAscending = orderBy.ToLower() == "asc";
            DateTime today = DateTime.UtcNow;

            var eventsQuery = _context.Events
                .Include(e => e.Creator) // ✅ โหลดข้อมูล Creator
                .Include(e => e.Participants) // ✅ โหลดข้อมูล Participants
                .Where(e => e.ExpiryDate >= today && !e.IsClosed) // ✅ กรองเฉพาะกิจกรรมที่ยังไม่หมดอายุ
                .AsQueryable();

            var orderedEvents = isAscending
                ? await eventsQuery.OrderBy(e => e.CreatedAt).Take(3).ToListAsync()
                : await eventsQuery.OrderByDescending(e => e.CreatedAt).Take(3).ToListAsync();

            // ✅ Debug เช็คจำนวน Event ที่โหลดมาได้
            Console.WriteLine($"🟢 Events Loaded: {orderedEvents.Count}");

            if (orderedEvents == null || !orderedEvents.Any())
            {
                Console.WriteLine("❌ No events found after filtering.");
                return Json(new { message = "No events available" });
            }

            var events = orderedEvents
                .Select(e => new
                {
                    e.Id,
                    Title = string.IsNullOrEmpty(e.Title) ? "No Title" : e.Title, // ✅ ป้องกัน null
                    Description = string.IsNullOrEmpty(e.Description) ? "No Description" : e.Description, // ✅ ป้องกัน null
                    e.EventTime,
                    Tags = string.IsNullOrEmpty(e.Tags) ? "No Tags" : e.Tags, // ✅ ป้องกัน null
                                                                              //e.ViewCount,
                    e.MaxParticipants,
                    Location = string.IsNullOrEmpty(e.Location) ? "No Location" : e.LocationName, // ✅ ป้องกัน null
                    e.CreatedAt,
                    CurrentParticipants = e.Participants?.Count(p => p.Status == ParticipationStatus.Approved) ?? 0, // ✅ ป้องกัน null
                    Creator = e.Creator?.Username ?? "Unknown Creator" // ✅ ป้องกัน null
                })
                .ToList();


            return Json(events);
        }

        [HttpGet]
        public async Task<IActionResult> GetEventUpcoming()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                Console.WriteLine($"❌ User not authenticated");
                return Unauthorized("❌ User not authenticated");
            }

            int userId = int.Parse(userIdClaim.Value); // ✅ แปลงค่า User ID เป็น int
            Console.WriteLine($"🆔 Authenticated User ID: {userId}");

            var today = DateTime.UtcNow;

            var events = await _context.Events
                .Include(e => e.Creator)
                .Include(e => e.Participants)
                .Where(e => e.EventTime > today) // ✅ อีเวนต์ต้องอยู่ในอนาคต
                .Where(e => e.Participants != null && e.Participants.Any(p => p.UserId == userId)) // ✅ เช็คว่ามีผู้ใช้คนนี้ไหม
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.EventTime,
                    e.Location,
                    CurrentParticipants = e.Participants.Count(p => p.Status == ParticipationStatus.Approved),
                    Creator = e.Creator != null ? e.Creator.Username : "Unknown"
                })
                .ToListAsync();

            return Json(events);
        }

        [Authorize]
        [HttpGet]
        public IActionResult Chat(int id)
        {
            var eventExists = _context.Events.Any(e => e.Id == id);
            if (!eventExists)
            {
                return NotFound();
            }

            return View(id); // ส่ง EventId ไปที่ View
        }

        [HttpGet("Event/SearchPage")]
        public async Task<IActionResult> SearchPage(string searchQuery, string sortOrder)
        {
            ViewBag.Tags = _context.Tags.ToList(); // ✅ โหลดแท็กทั้งหมด
            ViewBag.sortOrder = sortOrder;

            var events = _context.Events
                .Include(e => e.Creator)
                .Include(e => e.Participants)
                .Include(e => e.EventTags)
                .ThenInclude(et => et.Tag)
                .Where(e => e.ExpiryDate >= DateTime.UtcNow)
                .Where(e => !e.IsClosed)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchQuery))
            {
                events = events.Where(e => e.Title.Contains(searchQuery) || e.Description.Contains(searchQuery));
            }

            var eventList = await events.ToListAsync();

            Console.WriteLine($"🔍 Found {eventList.Count} events for query: {searchQuery}");

            return View("Search", eventList); // ✅ โหลด `Search.cshtml` พร้อมผลลัพธ์
        }



        [HttpGet("Event/SearchResults")]
        public async Task<IActionResult> SearchResults(string searchQuery, List<int> selectedTags, string sortOrder)
        {
            var events = _context.Events
                .Include(e => e.Creator)
                .Include(e => e.Participants)
                .Include(e => e.EventTags)
                .ThenInclude(et => et.Tag)
                .Where(e => e.ExpiryDate >= DateTime.UtcNow) // ✅ กรองเฉพาะกิจกรรมที่ยังไม่หมดอายุ
                .Where(e => !e.IsClosed) // ✅ กรองเฉพาะกิจกรรมที่ยังไม่ปิดรับสมัคร
                .AsQueryable();

            // ✅ ใช้ `searchQuery` และ `selectedTags` พร้อมกัน
            if (!string.IsNullOrEmpty(searchQuery))
            {
                events = events.Where(e => e.Title.Contains(searchQuery) || e.Description.Contains(searchQuery));
            }

            if (selectedTags != null && selectedTags.Count > 0)
            {
                events = events.Where(e => selectedTags.All(tagId => e.EventTags.Any(et => et.TagId == tagId)));
            }

            // ✅ จัดเรียงตาม `sortOrder`
            switch (sortOrder)
            {
                case "recent":
                    events = events.OrderByDescending(e => e.CreatedAt);
                    break;
                case "popular":
                    events = events.OrderByDescending(e => e.ViewCount);
                    break;
                case "NerestEvent":
                    events = events.OrderBy(e => e.EventTime);
                    break;
                default:
                    events = events.OrderBy(e => e.Title);
                    break;
            }

            var eventList = await events.ToListAsync();

            return PartialView("_SearchResults", eventList);
        }


    }
}
