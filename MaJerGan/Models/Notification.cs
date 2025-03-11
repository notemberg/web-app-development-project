using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaJerGan.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; } // รหัสแจ้งเตือน (Primary Key)

        [Required]
        public int UserId { get; set; } // รหัสผู้ใช้ที่ได้รับแจ้งเตือน

        [ForeignKey("UserId")]
        public virtual User User { get; set; } // ความสัมพันธ์กับตาราง User

        public int? EventId { get; set; } // รหัสกิจกรรมที่เกี่ยวข้อง (ถ้ามี)

        [ForeignKey("EventId")]
        public virtual Event Event { get; set; } // ความสัมพันธ์กับตาราง Event

        public int? receiverId { get; set; } 

        [Required]
        [MaxLength(255)]
        public string Message { get; set; } // ข้อความแจ้งเตือน

        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = "General"; // ประเภทการแจ้งเตือน (เช่น "EventUpdate", "JoinRequest", "Approval")

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Unread"; // สถานะแจ้งเตือน (Unread / Read)

        public DateTime CreatedAt { get; set; } = DateTime.Now; // เวลาที่แจ้งเตือนถูกสร้าง
    }
}
