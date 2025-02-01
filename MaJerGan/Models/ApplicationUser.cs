using Microsoft.AspNetCore.Identity;

namespace MaJerGan.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
    }
}
