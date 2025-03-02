using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BCrypt.Net;

namespace MaJerGan.Models
{

    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(6)]
        public string PasswordHash { get; set; }

        [Required, MaxLength(50)]
        public string Username { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string Gender { get; set; } // ✅ เปลี่ยนเป็น Enum

        [MaxLength(500)]
        public string ProfilePicturee { get; set; } = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
        // optional
        [Phone]
        [MaxLength(15)] // ✅ ปรับให้รองรับเบอร์โทรมากขึ้น
        public string Phone { get; set; }

        [NotMapped] // ✅ ไม่บันทึกลงฐานข้อมูล
        public string Password { get; set; }

        // ✅ เชื่อมความสัมพันธ์กับ UserTags
        public List<UserTag> UserTags { get; set; } = new List<UserTag>();

        // ✅ เพิ่มความสัมพันธ์กับ EventParticipant
        public virtual List<EventParticipant> JoinedEvents { get; set; } = new List<EventParticipant>();

        // ✅ เพิ่ม CreatedAt และ UpdatedAt
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public void SetPassword(string password)
        {
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password)
        {
            return BCrypt.Net.BCrypt.Verify(password, PasswordHash);
        }
    }

    public class UserTag
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        [Required, MaxLength(30)]
        public string Tag { get; set; }
    }
}
