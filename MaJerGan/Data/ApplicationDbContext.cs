// using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
// using Microsoft.EntityFrameworkCore;
// using MaJerGan.Models;

// namespace MaJerGan.Data
// {
//     public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
//     {
//         public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
//             : base(options)
//         {
//         }

//         public DbSet<Event> Events { get; set; }
//         public DbSet<EventParticipant> EventParticipants { get; set; }
//     }
// }
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MaJerGan.Models;

namespace MaJerGan.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Event> Events { get; set; }  // ✅ ตรวจสอบว่ามี Event
        public DbSet<Tag> Tags { get; set; } // ✅ เพิ่มนี้เข้าไป

        public DbSet<User> Users { get; set; }
        public DbSet<UserTag> UserTags { get; set; }

    }
}
