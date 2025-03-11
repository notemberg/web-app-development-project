using System;
using System.Collections.Generic;

namespace MaJerGan.Models
{
    public class ActivityLogViewModel
    {
        public int Id { get; set; } // Add the Id property
        public string EventTitle { get; set; }
        public string HostName { get; set; }
        public DateTime EventTime { get; set; }
        public string Status { get; set; }
        public string LocationName { get; set; } // Add the LocationName property
        public string Tags { get; set; } // Add the Tags property
        public int MaxParticipants { get; set; } // Add MaxParticipants property
        public int ApprovedParticipants { get; set; } // Add ApprovedParticipants property
    }

    public class ActivityLogIndexViewModel
    {
        public List<ActivityLogViewModel> HostedActivities { get; set; } = new List<ActivityLogViewModel>();
        public List<ActivityLogViewModel> PendingActivities { get; set; } = new List<ActivityLogViewModel>(); // Add PendingActivities property
        public List<ActivityLogViewModel> ApprovedActivities { get; set; } = new List<ActivityLogViewModel>(); // Add ApprovedActivities property
        public string UserName { get; set; } // Add the username property
        public int UserId { get; set; } // Add the user ID property
        public string ProfilePicture { get; set; } // Add the profile picture property
        public string Email { get; set; } // Add the email property
        public string Phone { get; set; } // Add the telephone property
        public string Gender { get; set; }
        public bool IsOwner { get; set; } // Add the IsOwner property
    }
}
