
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MaJerGan.Data;
using MaJerGan.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace MaJerGan.Controllers
{
    public class EventController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;


        public EventController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [Authorize]
        public IActionResult Create()
        {
            return View();
        }

        public async Task<IActionResult> Index()
        {
            var events = await _context.Events.ToListAsync();
            return View(events);
        }

        [HttpPost]
        [Authorize]
        // public async Task<IActionResult> Create(Event model)
        // {
        //     if (ModelState.IsValid)
        //     {
        //         _context.Events.Add(model);
        //         await _context.SaveChangesAsync();
        //         return RedirectToAction("Index");
        //     }
        //     return View(model);
        // }
        public async Task<IActionResult> Create(Event model)
        {
            // ✅ ดึงข้อมูล User ที่ล็อกอิน
            var user = await _userManager.GetUserAsync(User);

            if (user == null)
            {
                return RedirectToAction("Login", "Auth");
            }

            if (ModelState.IsValid)
            {
                model.CreatedByUserId = user.Id; // ✅ ใช้ UserId จาก Identity
                model.CreatedAt = DateTime.Now;

                _context.Events.Add(model);
                await _context.SaveChangesAsync();
                return RedirectToAction("Index");
            }
            return View(model);
        }

        [HttpGet]
        [Route("Details/{id}")]
        public IActionResult Details(int id)
        {
            var eventDetails = _context.Events.FirstOrDefault(e => e.Id == id);
            if (eventDetails == null)
            {
                return NotFound();
            }
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

    }
}
