using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MaJerGan.Data;
using MaJerGan.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using MaJerGan.Middleware;

namespace MaJerGan.Controllers
{
    public class EventController : Controller
    {
        private readonly ApplicationDbContext _context;

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
        public async Task<IActionResult> Create(Event model)
        {
            // if (ModelState.IsValid)
            // {
            //     _context.Events.Add(model);
            //     await _context.SaveChangesAsync();
            //     return RedirectToAction("Index");
            // }
            // return View(model);
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(); // ถ้าไม่มี User ID ให้ปฏิเสธการสร้างกิจกรรม
            }

            int userId = int.Parse(userIdClaim.Value); // แปลงค่าจาก string เป็น int

            // ✅ กำหนดผู้สร้างกิจกรรม
            model.CreatedBy = userId;

            _context.Events.Add(model);
            _context.SaveChanges();

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
                return BadRequest("คุณได้เข้าร่วมกิจกรรมนี้แล้ว");
            }

            var participation = new EventParticipant
            {
                EventId = eventId,
                UserId = userId,
                Status = 1 // ✅ อนุมัติอัตโนมัติ
            };

            _context.EventParticipants.Add(participation);
            await _context.SaveChangesAsync();

            await WebSocketHandler.BroadcastMessage("Event Joined!");

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
                    CurrentParticipants = e.Participants.Count,
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
                .Where(e => e.ExpiryDate >= today) // ✅ กรองเฉพาะกิจกรรมที่ยังไม่หมดอายุ
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
        Location = string.IsNullOrEmpty(e.Location) ? "No Location" : e.Location, // ✅ ป้องกัน null
        //e.ExpiryDate,
        e.CreatedAt,
        CurrentParticipants = e.Participants?.Count ?? 0, // ✅ ป้องกัน null
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
                    CurrentParticipants = e.Participants.Count,
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

        public async Task<IActionResult> Search(string searchQuery, string sortOrder)
        {
            var events = _context.Events
                .Include(e => e.Creator)
                .Include(e => e.Participants)
                .Where(e => e.ExpiryDate >= DateTime.UtcNow) // กรองเฉพาะกิจกรรมที่ยังไม่หมดอายุ
                .Where(e => !e.IsClosed) // กรองเฉพาะกิจกรรมที่ยังไม่ปิดรับสมัคร
                .AsQueryable();

            // ตรวจสอบว่า searchQuery หรือ selectedTag ไม่เป็น null และทำการกรอง
            if (!string.IsNullOrEmpty(searchQuery))
            {
                events = events.Where(e => e.Title.Contains(searchQuery));
            }

            // การจัดเรียงตาม sortOrder
            switch (sortOrder)
            {
                case "recent":
                    events = events.OrderBy(e => e.CreatedAt);
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
            if (eventList == null)
            {
                // ค่าที่ส่งไปยัง View ควรมีข้อมูล ถ้าไม่มีให้ส่งข้อมูลที่เหมาะสม
                eventList = new List<MaJerGan.Models.Event>();
            }

            return View(eventList); // ส่งข้อมูลไปยัง View
        }


    }
}
