using System;
using System.Collections.Generic;

namespace MaJerGan.Models
{
    public class ActivityLogViewModel
    {
        public string EventTitle { get; set; } = string.Empty;
        public string HostName { get; set; } = string.Empty;
        public DateTime EventTime { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class ActivityLogIndexViewModel
    {
        public List<ActivityLogViewModel> HostedActivities { get; set; } = new List<ActivityLogViewModel>();
        public List<ActivityLogViewModel> JoinedActivities { get; set; } = new List<ActivityLogViewModel>();
    }
}
