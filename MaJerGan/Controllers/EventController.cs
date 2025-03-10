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

            // ✅ เพิ่ม Creator เข้าเป็นผู้เข้าร่วมโดยอัตโนมัติ
            var creatorParticipation = new EventParticipant
            {
                EventId = model.Id,
                UserId = userId,
                Status = ParticipationStatus.Approved // ✅ อนุมัติทันที
            };

            _context.EventParticipants.Add(creatorParticipation);
            await _context.SaveChangesAsync();

            return RedirectToAction("Details", new { id = model.Id });
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

            _context.EventParticipants.RemoveRange(_context.EventParticipants.Where(p => p.EventId == id));
            _context.EventTags.RemoveRange(_context.EventTags.Where(et => et.EventId == id));
            _context.Notifications.RemoveRange(_context.Notifications.Where(n => n.EventId == id));

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
                if (existingParticipation.Status == ParticipationStatus.Pending)
                {
                    return BadRequest("คำขอเข้าร่วมกิจกรรมนี้อยู่ระหว่างพิจารณาอยู่แล้ว");
                }
                if (existingParticipation.Status == ParticipationStatus.Approved)
                {
                    return BadRequest("คุณได้เข้าร่วมกิจกรรมนี้แล้ว");
                }
            }

            var eventDetails = await _context.Events.FindAsync(eventId);
            if (eventDetails == null)
            {
                return NotFound("ไม่พบกิจกรรมนี้");
            }

            if (eventDetails.IsClosed)
            {
                return BadRequest("กิจกรรมนี้ปิดรับสมัครแล้ว");
            }

            if (eventDetails.MaxParticipants > 0)
            {
                var currentParticipants = await _context.EventParticipants
                    .CountAsync(p => p.EventId == eventId && p.Status == ParticipationStatus.Approved);

                if (currentParticipants >= eventDetails.MaxParticipants)
                {
                    return BadRequest("กิจกรรมนี้เต็มแล้ว");
                }
            }

            // ✅ ตรวจสอบเพศของผู้ใช้เฉพาะเมื่อ IsGenderRestricted = 1
            var user = await _context.Users.FindAsync(userId);
            if (eventDetails.IsGenderRestricted)
            {
                if (string.IsNullOrEmpty(eventDetails.AllowedGenders))
                {
                    return BadRequest("❌ กิจกรรมนี้ถูกจำกัดเพศ แต่ไม่ได้กำหนด AllowedGenders");
                }

                var allowedGenders = eventDetails.AllowedGenders.Split(',').Select(g => g.Trim()).ToList();
                if (user.Gender == null || !allowedGenders.Contains(user.Gender))
                {
                    return BadRequest("❌ คุณไม่สามารถเข้าร่วมกิจกรรมนี้ได้ เนื่องจากเพศของคุณไม่ได้รับอนุญาต");
                }
            }

            Console.WriteLine($"🔍 Event RequiresConfirmation: {eventDetails.RequiresConfirmation}");
            if (existingParticipation != null && existingParticipation.Status == ParticipationStatus.Rejected)
            {
                existingParticipation.Status = ParticipationStatus.Pending;
                await _context.SaveChangesAsync();
                return RedirectToAction("Details", new { id = eventId });
            }

            var participation = new EventParticipant
            {
                EventId = eventId,
                UserId = userId,
                Status = eventDetails.RequiresConfirmation ? ParticipationStatus.Pending : ParticipationStatus.Approved
            };

            _context.EventParticipants.Add(participation);
            await _context.SaveChangesAsync();

            int hostId = eventDetails.CreatedBy; // ✅ Host ของ Event

            string hostMessage;
            if (eventDetails.RequiresConfirmation)
            {
                hostMessage = $"📩 มีผู้ใช้ ID {user.Username} ขอเข้าร่วมกิจกรรม {eventDetails.Title}";
            }
            else
            {
                hostMessage = $"📩 ผู้ใช้ ID {user.Username} ได้เข้าร่วมกิจกรรม {eventDetails.Title}";
            }

            var notificationForHost = new Notification
            {
                UserId = hostId,
                EventId = eventId,
                Message = hostMessage,
                Type = "JoinRequest",
                Status = "Unread"
            };

            _context.Notifications.Add(notificationForHost);

            await NotificationWebSocketHandler.SendNotificationToUser(hostId, hostMessage);

            string userMessage;
            if (eventDetails.RequiresConfirmation)
            {
                userMessage = $"📩 คำขอเข้าร่วมกิจกรรม {eventDetails.Title} ของคุณถูกส่งไปแล้ว";
            }
            else
            {
                userMessage = $"📩 คำขอเข้าร่วมกิจกรรม {eventDetails.Title} ของคุณได้รับการอนุมัติแล้ว";
            }

            var notificationForUser = new Notification
            {
                UserId = userId,
                EventId = eventId,
                Message = userMessage,
                Type = "JoinRequest",
                Status = "Unread"
            };

            _context.Notifications.Add(notificationForUser);

            await NotificationWebSocketHandler.SendNotificationToUser(userId, userMessage);


            await WebSocketHandler.BroadcastMessage($"User {userId} joined event {eventId}");

            await _context.SaveChangesAsync();

            return RedirectToAction("Details", new { id = eventId });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Leave(int eventId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim.Value);

            var participation = await _context.EventParticipants
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);

            if (participation == null)
            {
                return BadRequest("คุณไม่ได้เข้าร่วมกิจกรรมนี้");
            }

            _context.EventParticipants.Remove(participation);
            await _context.SaveChangesAsync();

            await NotificationWebSocketHandler.SendNotificationToUser(userId, $"📩 คุณได้ออกจากกิจกรรม ID {eventId}");

            return RedirectToAction("Details", new { id = eventId });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Approve(int eventId, int userId)
        {
            var eventDetails = await _context.Events.FindAsync(eventId);
            if (eventDetails == null)
            {
                return NotFound("ไม่พบกิจกรรมนี้");
            }

            var participation = await _context.EventParticipants
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);

            if (participation == null)
            {
                return NotFound("ไม่พบผู้ใช้นี้ในรายชื่อเข้าร่วม");
            }

            if (participation.Status == ParticipationStatus.Approved)
            {
                return BadRequest("ผู้ใช้นี้ได้รับการอนุมัติแล้ว");
            }

            if (eventDetails.MaxParticipants > 0)
            {
                var currentParticipants = await _context.EventParticipants
                    .CountAsync(p => p.EventId == eventId && p.Status == ParticipationStatus.Approved);

                if (currentParticipants >= eventDetails.MaxParticipants)
                {
                    return BadRequest("กิจกรรมนี้เต็มแล้ว");
                }
            }

            participation.Status = ParticipationStatus.Approved;
            await _context.SaveChangesAsync();

            string userMessage = $"📩 คำขอเข้าร่วมกิจกรรม {eventDetails.Title} ของคุณได้รับการอนุมัติแล้ว";

            var notificationForUser = new Notification
            {
                UserId = userId,
                EventId = eventId,
                Message = userMessage,
                Type = "JoinConfirmation",
                Status = "Unread"
            };

            _context.Notifications.Add(notificationForUser);
            await _context.SaveChangesAsync();

            await NotificationWebSocketHandler.SendNotificationToUser(userId, userMessage);

            return RedirectToAction("Details", new { id = eventId });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Reject(int eventId, int userId, string reason)
        {
            var eventDetails = await _context.Events.FindAsync(eventId);
            if (eventDetails == null)
            {
                return NotFound("ไม่พบกิจกรรมนี้");
            }

            var participation = await _context.EventParticipants
                .FirstOrDefaultAsync(p => p.EventId == eventId && p.UserId == userId);

            if (participation == null)
            {
                return NotFound("ไม่พบผู้ใช้นี้ในรายชื่อเข้าร่วม");
            }

            if (participation.Status == ParticipationStatus.Rejected)
            {
                return BadRequest("ผู้ใช้นี้ถูกปฏิเสธแล้ว");
            }

            participation.Status = ParticipationStatus.Rejected;
            participation.RejectedReason = "test";
            await _context.SaveChangesAsync();

            string userMessage = $"📩 คำขอเข้าร่วมกิจกรรม {eventDetails.Title} ของคุณถูกปฏิเสธ: test";

            var notificationForUser = new Notification
            {
                UserId = userId,
                EventId = eventId,
                Message = userMessage,
                Type = "JoinRejection",
                Status = "Unread"
            };

            _context.Notifications.Add(notificationForUser);
            await _context.SaveChangesAsync();

            await NotificationWebSocketHandler.SendNotificationToUser(userId, userMessage);


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
                    creator = e.Creator.Username, // ✅ เพิ่มชื่อผู้สร้าง
                    e.EventTime,
                    e.AllowedGenders,
                    e.LocationImage,
                    e.LocationName
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
                    Creator = e.Creator?.Username ?? "Unknown Creator", // ✅ ป้องกัน null
                    e.LocationImage,
                    e.LocationName,
                    e.AllowedGenders
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
                .Where(e => e.Participants != null && e.Participants.Any(p => p.UserId == userId && p.Status == ParticipationStatus.Approved)) // ✅ เช็คว่ามีผู้ใช้คนนี้ไหม
                .Select(e => new
                {
                    e.Id,
                    e.Title,
                    e.EventTime,
                    e.Location,
                    e.LocationName,
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


        [HttpGet]
        public async Task<IActionResult> GetComments(int eventId)
        {
            var comments = await _context.Comments
                .Where(c => c.EventId == eventId)
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new
                {
                    Username = c.User.Username,
                    ProfileImg = c.User.ProfilePicturee,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt.ToString("dd MMM yyyy @ hh:mm tt")
                })
                .ToListAsync();

            return Json(comments);
        }

        // ✅ 7️⃣ โพสต์คอมเมนต์ใหม่
        [HttpPost]
        public async Task<IActionResult> PostComment(int eventId, string content)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("❌ กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
            }

            int userId = int.Parse(userIdClaim.Value);

            if (string.IsNullOrWhiteSpace(content))
            {
                return BadRequest("❌ กรุณากรอกข้อความก่อนส่ง");
            }

            var comment = new Comment
            {
                EventId = eventId,
                UserId = userId,
                Content = content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "✅ แสดงความคิดเห็นสำเร็จ!" });
        }

        [HttpGet("Event/UpcomingEvents")]
        public async Task<IActionResult> UpcomingEvents(string searchQuery)
        {
            ViewBag.Tags = _context.Tags.ToList(); // ✅ โหลดแท็กทั้งหมด

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("❌ กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
            }

            int userId = int.Parse(userIdClaim.Value);
            var events = _context.Events
                .Include(e => e.Creator)
                .Include(e => e.Participants)
                .Include(e => e.EventTags)
                .ThenInclude(et => et.Tag)
                .Where(e => e.ExpiryDate >= DateTime.UtcNow) // ✅ กรองเฉพาะกิจกรรมที่ยังไม่หมดอายุ
                .Where(e => e.Participants.Any(p => p.UserId == userId && p.Status == ParticipationStatus.Approved)) // ✅ เฉพาะกิจกรรมที่ผู้ใช้เข้าร่วมและได้รับการอนุมัติ

                .AsQueryable();


            if (!string.IsNullOrEmpty(searchQuery))
            {
                events = events.Where(e => e.Title.Contains(searchQuery) || e.Description.Contains(searchQuery));
            }

            var eventList = await events.ToListAsync();

            Console.WriteLine($"🔍 Found {eventList.Count} events for query: {searchQuery}");

            return View("UpcomingEvents", eventList); // ✅ โหลด `Search.cshtml` พร้อมผลลัพธ์
        }



        [HttpGet("Event/UpcomingEventsResults")]
        public async Task<IActionResult> UpcomingEventsResults(string searchQuery, List<int> selectedTags)
        {

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("❌ กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
            }

            int userId = int.Parse(userIdClaim.Value);
            var events = _context.Events
                .Include(e => e.Creator)
                .Include(e => e.Participants)
                .Include(e => e.EventTags)
                .ThenInclude(et => et.Tag)
                .Where(e => e.ExpiryDate >= DateTime.UtcNow) // ✅ กรองเฉพาะกิจกรรมที่ยังไม่หมดอายุ
                .Where(e => e.Participants.Any(p => p.UserId == userId && p.Status == ParticipationStatus.Approved)) // ✅ เฉพาะกิจกรรมที่ผู้ใช้เข้าร่วมและได้รับการอนุมัติ

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



            var eventList = await events.ToListAsync();

            return PartialView("_UpcomingEventsResults", eventList);
        }





    }
}
