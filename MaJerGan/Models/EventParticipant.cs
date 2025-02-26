using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaJerGan.Models
{
    public class EventParticipant
    {
        [Key]
        public int Id { get; set; }

        // ✅ เชื่อมกับ Event
        [Required]
        public int EventId { get; set; }
        
        [ForeignKey("EventId")]
        public virtual Event Event { get; set; } = new Event();

        // ✅ เชื่อมกับ User
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = new User();

        // วันที่เข้าร่วม
        public DateTime JoinedAt { get; set; } = DateTime.Now;

        // ✅ เพิ่มสถานะการเข้าร่วม (0 = รออนุมัติ, 1 = อนุมัติแล้ว)
        public int Status { get; set; } = 0; 
    }
}
