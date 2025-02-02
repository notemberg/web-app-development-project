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
        public string PasswordHash { get; set; }  // เก็บรหัสผ่านที่ถูก Hash แล้ว

        [Required, MaxLength(50)]
        public string Username { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [NotMapped]
        public string Password { get; set; }  // ไม่บันทึกลงฐานข้อมูล

        public List<UserTag> UserTags { get; set; } = new List<UserTag>();

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
