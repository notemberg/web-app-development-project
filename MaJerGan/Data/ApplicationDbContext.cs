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

        public DbSet<EventParticipant> EventParticipants { get; set; } // ✅ ตรวจสอบว่ามี EventParticipant
        public DbSet<Tag> Tags { get; set; } // ✅ เพิ่มนี้เข้าไป

        public DbSet<User> Users { get; set; }
        public DbSet<UserTag> UserTags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserTag>()
                .HasOne(ut => ut.User)
                .WithMany(u => u.UserTags)
                .HasForeignKey(ut => ut.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<EventParticipant>()
                .HasOne(ep => ep.Event)
                .WithMany(e => e.Participants)
                .HasForeignKey(ep => ep.EventId)
                .OnDelete(DeleteBehavior.Restrict); // ✅ แทนที่ CASCADE ด้วย RESTRICT

            modelBuilder.Entity<EventParticipant>()
                .HasOne(ep => ep.User)
                .WithMany(u => u.JoinedEvents)
                .HasForeignKey(ep => ep.UserId)
                .OnDelete(DeleteBehavior.Restrict); // ✅ แทนที่ CASCADE ด้วย RESTRICT
        }

    }
}
