using System;
using System.ComponentModel.DataAnnotations;

namespace MiniProject.Models
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
    }
}
