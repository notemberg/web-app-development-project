using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaJerGan.Data;
using MaJerGan.Models;
using System.Security.Claims;

namespace MaJerGan.Controllers
{
    [Route("ActivityLog")]
    public class ActivityLogController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ActivityLogController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet()]
        public IActionResult Index()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return RedirectToAction("Login", "Auth");
            }

            int userId = int.Parse(userIdClaim.Value);

            var activities = _context.EventParticipants
                                     .Where(ep => ep.UserId == userId)
                                     .Select(ep => new ActivityLogViewModel
                                     {
                                         EventTitle = ep.Event.Title,
                                         HostName = ep.Event.Creator.UserName, // Use Creator instead of Host
                                         JoinedAt = ep.JoinedAt,
                                         Status = ep.Status == 0 ? "Inactive" : "Active"
                                     })
                                     .ToList();

            return View(activities);
        }
    }
}
