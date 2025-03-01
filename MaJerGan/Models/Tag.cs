using System.ComponentModel.DataAnnotations;

namespace MaJerGan.Models
{
    public class Tag
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } // ชื่อแท็ก เช่น "Sports", "Music"

        public virtual List<EventTag> EventTags { get; set; } = new List<EventTag>();
    }
}
