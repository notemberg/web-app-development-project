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


        [Required]
        public int CreatedBy { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User Creator { get; set; }
        

        // ✅ เพิ่มตัวนับยอดเข้าชม
        public int ViewCount { get; set; } = 0;
        
    }
}

