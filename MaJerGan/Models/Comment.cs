using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MaJerGan.Models
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EventId { get; set; } // เชื่อมกับกิจกรรม

        [ForeignKey("EventId")]
        public virtual Event Event { get; set; }

        [Required]
        public int UserId { get; set; } // เชื่อมกับ User

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [Required]
        [StringLength(500)]
        public string Content { get; set; } // เนื้อหาคอมเมนต์

        public DateTime CreatedAt { get; set; } = DateTime.Now; // วันที่โพสต์
    }
}
