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

        // [HttpPost]
        // public async Task<IActionResult> Register(User user)
        // {
        //     if (!ModelState.IsValid)
        //     {
        //         var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
        //         Console.WriteLine("Validation Errors: " + string.Join(", ", errors)); // Log เช็ค Errors
        //         return View(user);
        //     }

        //     // ✅ เช็คว่า Password ไม่เป็น null
        //     if (string.IsNullOrEmpty(user.Password))
        //     {
        //         ModelState.AddModelError("Password", "Password is required.");
        //         return View(user);
        //     }

        //     // ✅ แฮชรหัสผ่านก่อนบันทึก
        //     user.SetPassword(user.Password);

        //     _context.Users.Add(user);
        //     await _context.SaveChangesAsync();

        //     Console.WriteLine("User Saved to Database: " + user.Email);
        //     return RedirectToAction("Login");
        // }
        [HttpPost]
        public async Task<IActionResult> Register(User user)
        {
            // if (!ModelState.IsValid)
            // {
            //     var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
            //     Console.WriteLine("Validation Errors form Auth: " + string.Join(", ", errors)); // Log เช็ค Errors
            //     return View(user);
            // }

            // // ✅ ตรวจสอบว่าฟิลด์ Password ไม่เป็น null
            // if (string.IsNullOrEmpty(user.Password))
            // {
            //     ModelState.AddModelError("Password", "Password is required.");
            //     return View(user);
            // }

            // ✅ Log ก่อน Hash Password
            Console.WriteLine($"Before Hashing - Password: {user.Password}");

            // ✅ แฮชรหัสผ่านก่อนบันทึก
            user.SetPassword(user.Password);

            // ✅ Log หลัง Hash Password
            Console.WriteLine($"After Hashing - PasswordHash: {user.PasswordHash}");

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            Console.WriteLine("User Saved to Database: " + user.Email);
            return RedirectToAction("Login");
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
    
            return RedirectToAction("index", "HOME");
        }

        // ✅ ออกจากระบบ
        public IActionResult Logout()
        {
            HttpContext.Session.Clear(); // ล้างข้อมูล Session
            return RedirectToAction("Login");
        }
    }
}
