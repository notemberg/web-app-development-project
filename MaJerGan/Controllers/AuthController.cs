// using Microsoft.AspNetCore.Mvc;
// using MaJerGan.Data;
// using MaJerGan.Models;
// using System.Linq;
// using System.Threading.Tasks;

// namespace MaJerGan.Controllers
// {
//     public class AuthController : Controller
//     {
//         private readonly ApplicationDbContext _context;

//         public AuthController(ApplicationDbContext context)
//         {
//             _context = context;
//         }

//         // ✅ หน้า Register
//         [HttpGet]
//         public IActionResult Register()
//         {
//             return View();
//         }

//         [HttpPost]
//         public async Task<IActionResult> Register(User user)
//         {

//             // ✅ Log ก่อน Hash Password
//             Console.WriteLine($"Before Hashing - Password: {user.Password}");

//             // ✅ แฮชรหัสผ่านก่อนบันทึก
//             user.SetPassword(user.Password);

//             // ✅ Log หลัง Hash Password
//             Console.WriteLine($"After Hashing - PasswordHash: {user.PasswordHash}");

//             _context.Users.Add(user);
//             await _context.SaveChangesAsync();

//             Console.WriteLine("User Saved to Database: " + user.Email);
//             return RedirectToAction("Login");
//         }




//         // ✅ หน้า Login
//         public IActionResult Login(string email, string password)
//         {
//             var user = _context.Users.FirstOrDefault(u => u.Email == email);
//             if (user == null || !user.VerifyPassword(password))
//             {
//                 ModelState.AddModelError("LoginError", "Invalid email or password");
//                 return View();
//             }

//             // ✅ เก็บ Session หลังล็อกอินสำเร็จ
//             HttpContext.Session.SetInt32("UserId", user.Id);
//             HttpContext.Session.SetString("Username", user.Username);

//             return RedirectToAction("index", "HOME");
//         }

//         // ✅ ออกจากระบบ
//         public IActionResult Logout()
//         {
//             HttpContext.Session.Clear(); // ล้างข้อมูล Session
//             return RedirectToAction("Login");
//         }
//     }
// }


using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MaJerGan.Data;
using MaJerGan.Models;

namespace MaJerGan.Controllers
{
    public class AuthController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [Route("api/register")]
        [HttpPost]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
            {
                return BadRequest(new { message = "Email นี้ถูกใช้งานแล้ว!" });
            }

            if (_context.Users.Any(u => u.Username == user.Username))
            {
                return BadRequest(new { message = "Username นี้ถูกใช้แล้ว!" });
            }

            // ✅ แฮชรหัสผ่านก่อนบันทึก
            user.SetPassword(user.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "สมัครสมาชิกสำเร็จ!" });
        }



        // [HttpPost]
        public async Task<IActionResult> Login(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null || !user.VerifyPassword(password)) // 🔹 เปลี่ยนเป็น Hash จริงถ้ามี
            {
                ModelState.AddModelError("LoginError", "Invalid email or password");
                return View();
            }

            // ✅ สร้าง `Claims` เพื่อนำไปใช้กับ `Authorize`
            var claims = new List<Claim>
            {
                 new Claim(ClaimTypes.Name, user.Username),
                 new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(claims, "MyCookieAuth");
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);


            Console.WriteLine($"User {user.Username} logged in successfully.");

            await HttpContext.SignInAsync("MyCookieAuth", claimsPrincipal);


            return RedirectToAction("Index", "Home"); // 🔹 ไปที่หน้าแรก
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("MyCookieAuth"); // ✅ ลบ `Cookie` ออกจากระบบ

            return RedirectToAction("Login");
        }
    }
}