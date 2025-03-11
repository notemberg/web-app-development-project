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
                var UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (UserId == null)
                {
                    return Unauthorized("User not logged in.");
                }
                id = int.Parse(UserId);
            }

            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var hostedActivities = _context.Events
                                           .Where(e => e.CreatedBy == id)
                                           .OrderByDescending(e => e.EventTime)
                                           .Select(e => new ActivityLogViewModel
                                           {
                                               Id = e.Id, // Set the Id property
                                               EventTitle = e.Title,
                                               HostName = e.Creator.Username,
                                               EventTime = e.EventTime,
                                               Status = "Hosted",
                                               LocationName = e.LocationName, // Set the LocationName property
                                               Tags = e.Tags, // Set the Tags property
                                               MaxParticipants = e.MaxParticipants, // Add MaxParticipants property
                                               ApprovedParticipants = _context.EventParticipants.Count(ep => ep.EventId == e.Id && ep.Status == ParticipationStatus.Approved) // Calculate approved participants
                                           })
                                           .ToList();

            var pendingActivities = _context.EventParticipants
                                            .Where(ep => ep.UserId == id && ep.Status == ParticipationStatus.Pending)
                                            .OrderByDescending(ep => ep.JoinedAt)
                                            .Select(ep => new ActivityLogViewModel
                                            {
                                                Id = ep.Event.Id, // Set the Id property
                                                EventTitle = ep.Event.Title,
                                                HostName = ep.Event.Creator.Username,
                                                EventTime = ep.Event.EventTime,
                                                Status = "Pending",
                                                LocationName = ep.Event.LocationName, // Set the LocationName property
                                                Tags = ep.Event.Tags, // Set the Tags property
                                                MaxParticipants = ep.Event.MaxParticipants, // Add MaxParticipants property
                                                ApprovedParticipants = _context.EventParticipants.Count(ep2 => ep2.EventId == ep.Event.Id && ep2.Status == ParticipationStatus.Approved) // Calculate approved participants
                                            })
                                            .ToList();

            var approvedActivities = _context.EventParticipants
                                             .Where(ep => ep.UserId == id && ep.Status == ParticipationStatus.Approved && ep.UserId != ep.Event.CreatedBy)
                                             .OrderByDescending(ep => ep.JoinedAt)
                                             .Select(ep => new ActivityLogViewModel
                                             {
                                                 Id = ep.Event.Id, // Set the Id property
                                                 EventTitle = ep.Event.Title,
                                                 HostName = ep.Event.Creator.Username,
                                                 EventTime = ep.Event.EventTime,
                                                 Status = "Approved",
                                                 LocationName = ep.Event.LocationName, // Set the LocationName property
                                                 Tags = ep.Event.Tags, // Set the Tags property
                                                 MaxParticipants = ep.Event.MaxParticipants, // Add MaxParticipants property
                                                 ApprovedParticipants = _context.EventParticipants.Count(ep2 => ep2.EventId == ep.Event.Id && ep2.Status == ParticipationStatus.Approved) // Calculate approved participants
                                             })
                                             .ToList();

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isOwner = currentUserId != null && int.Parse(currentUserId) == id;

            var model = new ActivityLogIndexViewModel
            {
                HostedActivities = hostedActivities,
                PendingActivities = pendingActivities,
                ApprovedActivities = approvedActivities,
                UserId = id.Value,
                UserName = user.Username, // Pass the username to the view
                ProfilePicture = user.ProfilePicturee, // Pass the profile picture to the view
                Email = user.Email, // Pass the email to the view
                Phone = user.Phone, // Pass the telephone to the view
                Gender = user.Gender,
                IsOwner = isOwner // Pass the IsOwner property to the view
            };

            return View(model);
        }
    }
}
