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

        public DbSet<EventTag> EventTags { get; set; } // ✅ ตรวจสอบว่ามี EventTag

        public DbSet<EventParticipant> EventParticipants { get; set; } // ✅ ตรวจสอบว่ามี EventParticipant
        public DbSet<Tag> Tags { get; set; } // ✅ เพิ่มนี้เข้าไป

        public DbSet<User> Users { get; set; }
        public DbSet<UserTag> UserTags { get; set; }


        public DbSet<Message> Messages { get; set; }

        public DbSet<Notification> Notifications { get; set; }



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

            // ✅ ลบข้อความทั้งหมดเมื่อ Event ถูกลบ
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Event)
                .WithMany()
                .HasForeignKey(m => m.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Restrict); // ✅ แทนที่ CASCADE ด้วย SET NULL

            // ✅ ใช้ Composite Key (EventId + TagId)
            modelBuilder.Entity<EventTag>()
                .HasKey(et => new { et.EventId, et.TagId });

            modelBuilder.Entity<EventTag>()
                .HasOne(et => et.Event)
                .WithMany(e => e.EventTags)
                .HasForeignKey(et => et.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EventTag>()
                .HasOne(et => et.Tag)
                .WithMany(t => t.EventTags)
                .HasForeignKey(et => et.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            // ตั้งค่าความสัมพันธ์ของ Notification
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Event)
                .WithMany()
                .HasForeignKey(n => n.EventId)
                .OnDelete(DeleteBehavior.SetNull);
        }

    }
}
