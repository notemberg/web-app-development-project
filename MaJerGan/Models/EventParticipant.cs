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
        public virtual Event Event { get; set; }

        // ✅ เชื่อมกับ User
        [Required]
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        // วันที่เข้าร่วม
        public DateTime JoinedAt { get; set; } = DateTime.Now;

        // ✅ ใช้ Enum แทน int เพื่อให้อ่านง่ายขึ้น
        public ParticipationStatus Status { get; set; } = ParticipationStatus.Pending;

        // ✅ เพิ่มเหตุผลในกรณีถูกปฏิเสธ
        [StringLength(255)]
        public string? RejectedReason { get; set; }
    }

    // ✅ Enum สำหรับสถานะการเข้าร่วม
    public enum ParticipationStatus
    {
        Pending = 0,  // รออนุมัติ
        Approved = 1, // อนุมัติแล้ว
        Rejected = 2  // ถูกปฏิเสธ
    }
}
