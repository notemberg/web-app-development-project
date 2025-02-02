using Microsoft.AspNetCore.Mvc;
using MaJerGan.Data;
using MaJerGan.Models;
using System.Linq;
using System.Threading.Tasks;

namespace MaJerGan.Controllers
{
    public class AuthController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ✅ หน้า Register
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(User user, List<string> tags)
        {
            if (tags.Count > 10)
            {
                ModelState.AddModelError("UserTags", "You can select up to 10 tags.");
                return View(user);
            }

            if (ModelState.IsValid)
            {
                user.SetPassword(user.Password); // Hash รหัสผ่าน
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                foreach (var tag in tags)
                {
                    _context.UserTags.Add(new UserTag { UserId = user.Id, Tag = tag });
                }

                await _context.SaveChangesAsync();
                return RedirectToAction("Login");
            }

            return View(user);
        }

        // ✅ หน้า Login
        public IActionResult Login(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null || !user.VerifyPassword(password))
            {
                ModelState.AddModelError("LoginError", "Invalid email or password");
                return View();
            }

            // ✅ เก็บ Session หลังล็อกอินสำเร็จ
            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("Username", user.Username);

            return RedirectToAction("Dashboard", "User");
        }

        // ✅ ออกจากระบบ
        public IActionResult Logout()
        {
            HttpContext.Session.Clear(); // ล้างข้อมูล Session
            return RedirectToAction("Login");
        }
    }
}
