using System;

namespace MaJerGan.Models
{
    public class ActivityLogViewModel
    {
        public string EventTitle { get; set; } = string.Empty;
        public string HostName { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
