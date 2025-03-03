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

        [HttpGet("{id?}")]
        public IActionResult Index(int? id)
        {
            if (id == null)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                {
                    return Unauthorized("User not logged in.");
                }
                id = int.Parse(userId);
            }

            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var hostedActivities = _context.Events
                                           .Where(e => e.CreatedBy == id)
                                           .Select(e => new ActivityLogViewModel
                                           {
                                               EventTitle = e.Title,
                                               HostName = e.Creator.Username,
                                               EventTime = e.EventTime,
                                               Status = "Hosted"
                                           })
                                           .ToList();

            var joinedActivities = _context.EventParticipants
                                           .Where(ep => ep.UserId == id && ep.Event.CreatedBy != id)
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
                JoinedActivities = joinedActivities,
                UserId = id.Value,
                UserName = user.Username // Pass the username to the view
            };

            return View(model);
        }
    }
}
