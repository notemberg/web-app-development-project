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

        [HttpGet("")]
        public IActionResult Index()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return RedirectToAction("Login", "Auth");
            }

            int userId = int.Parse(userIdClaim.Value);

            var hostedActivities = _context.Events
                                           .Where(e => e.CreatedBy == userId)
                                           .Select(e => new ActivityLogViewModel
                                           {
                                               EventTitle = e.Title,
                                               HostName = e.Creator.Username,
                                               EventTime = e.EventTime,
                                               Status = "Hosted"
                                           })
                                           .ToList();

            var joinedActivities = _context.EventParticipants
                                           .Where(ep => ep.UserId == userId)
                                           .Select(ep => new ActivityLogViewModel
                                           {
                                               EventTitle = ep.Event.Title,
                                               HostName = ep.Event.Creator.Username,
                                               EventTime = ep.Event.EventTime,
                                               Status = ep.Status == 0 ? "Inactive" : "Active"
                                           })
                                           .ToList();

            var model = new ActivityLogIndexViewModel
            {
                HostedActivities = hostedActivities,
                JoinedActivities = joinedActivities
            };

            return View(model);
        }
    }
}
