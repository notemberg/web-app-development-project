// using System;
// using System.ComponentModel.DataAnnotations;
// using System.Collections.Generic;

// namespace MaJerGan.Models
// {
//     public class Event
//     {
//         [Key]
//         public int Id { get; set; }

//         [Required]
//         public string Title { get; set; }

//         public string Description { get; set; }

//         [Required]
//         public int MaxParticipants { get; set; }

//         public DateTime ExpiryDate { get; set; }

//         public bool IsClosed { get; set; } = false;

//         public List<EventParticipant> Participants { get; set; }
//     }

//     public class EventParticipant
//     {
//         [Key]
//         public int Id { get; set; }

//         public string UserId { get; set; }

//         public ApplicationUser User { get; set; }

//         public int EventId { get; set; }

//         public Event Event { get; set; }

//         public DateTime JoinedAt { get; set; } = DateTime.Now;
//     }
// }

using System;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaJerGan.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; } // รหัสกิจกรรม (Primary Key)

        [Required]
        [StringLength(100)]
        public string Title { get; set; } // ชื่อกิจกรรม

        [Required]
        [StringLength(500)]
        public string Description { get; set; } // รายละเอียด

        [StringLength(200)]
        public string Tags { get; set; } // แท็กของกิจกรรม (เก็บเป็น String เช่น "Sport,Music")

        [Required]
        [Range(1, 1000)]
        public int MaxParticipants { get; set; } // จำนวนคนที่เข้าร่วมได้

        [Required]
        public DateTime EventTime { get; set; } // เวลาของกิจกรรม

        [Required]
        public DateTime ExpiryDate { get; set; } // วันปิดรับสมัคร

        [StringLength(500)]
        public string ExtraInfo { get; set; } // ข้อมูลเพิ่มเติม

        public DateTime CreatedAt { get; set; } = DateTime.Now; // วันที่สร้างกิจกรรม

        public string CreatedByUserId { get; set; } // รหัสผู้สร้างกิจกรรม

        [ForeignKey("CreatedByUserId")]
        public ApplicationUser CreatedByUser { get; set; } // ผู้สร้างกิจกรรม
    }
}

