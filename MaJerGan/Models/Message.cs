using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaJerGan.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; } // Primary Key

        // ✅ เชื่อมกับ Event (กิจกรรม)
        [Required]
        public int EventId { get; set; }
        [ForeignKey("EventId")]
        public virtual Event Event { get; set; }

        // ✅ เชื่อมกับ User (คนส่งข้อความ)
        [Required]
        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User? User { get; set; }

        // ✅ เนื้อหาข้อความ
        [Required]
        [MaxLength(1000)] // จำกัดความยาวของข้อความ
        public string Content { get; set; }

        // ✅ เวลาที่ส่งข้อความ
        public DateTime SentAt { get; set; } = DateTime.Now;
    }
}
