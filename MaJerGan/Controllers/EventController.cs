// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using MaJerGan.Data;
// using MaJerGan.Models;
// using System.Linq;
// using System.Threading.Tasks;

// namespace MaJerGan.Controllers
// {
//     public class EventController : Controller
//     {
//         private readonly ApplicationDbContext _context;
//         private readonly UserManager<ApplicationUser> _userManager;

//         public EventController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
//         {
//             _context = context;
//             _userManager = userManager;
//         }

//         public async Task<IActionResult> Index()
//         {
//             var events = await _context.Events.Where(e => !e.IsClosed && e.ExpiryDate > DateTime.Now).ToListAsync();
//             return View(events);
//         }

//         [Authorize]
//         public IActionResult Create()
//         {
//             return View();
//         }

//         [Authorize]
//         [HttpPost]
//         public async Task<IActionResult> Create(Event model)
//         {
//             if (ModelState.IsValid)
//             {
//                 _context.Events.Add(model);
//                 await _context.SaveChangesAsync();
//                 return RedirectToAction("Index");
//             }
//             return View(model);
//         }

//         [Authorize]
//         public async Task<IActionResult> Join(int id)
//         {
//             var user = await _userManager.GetUserAsync(User);
//             var evt = await _context.Events.Include(e => e.Participants).FirstOrDefaultAsync(e => e.Id == id);

//             if (evt != null && evt.Participants.Count < evt.MaxParticipants)
//             {
//                 _context.EventParticipants.Add(new EventParticipant { UserId = user.Id, EventId = id });
//                 await _context.SaveChangesAsync();
//             }

//             return RedirectToAction("Index");
//         }
//     }
// }

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MaJerGan.Data;
using MaJerGan.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

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

            return RedirectToAction("Details", new { id = eventId });
        }

        [HttpGet]
        public async Task<IActionResult> GetHotEvents()
        {
            var hotEvents = await _context.Events
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


    }
}
