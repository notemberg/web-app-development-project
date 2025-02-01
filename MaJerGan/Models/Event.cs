using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MaJerGan.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public int MaxParticipants { get; set; }

        public DateTime ExpiryDate { get; set; }

        public bool IsClosed { get; set; } = false;

        public List<EventParticipant> Participants { get; set; }
    }

    public class EventParticipant
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; }

        public ApplicationUser User { get; set; }

        public int EventId { get; set; }

        public Event Event { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.Now;
    }
}
