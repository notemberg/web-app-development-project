using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using MaJerGan.Data;
using MaJerGan.Models;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet]
        public IActionResult Interests()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [Route("api/check-register")]
        [HttpPost]
        public async Task<IActionResult> CheckEmail([FromBody] User request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Email นี้ถูกใช้ไปแล้ว!" });

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest(new { message = "Username นี้ถูกใช้ไปแล้ว!" });  
            
            return Ok(new { message = "สามารถใช้ Email และ Username นี้ได้" });
        }
        
        [Route("api/register")]
        [HttpPost]

        public async Task<IActionResult> Register([FromBody] User request)
        {   
            request.SetPassword(request.Password);

            try
            {
                Console.WriteLine("Registering new user...");

                // ตรวจสอบอีเมลซ้ำ
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                    return BadRequest(new { message = "Email นี้ถูกใช้ไปแล้ว!" });

                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                    return BadRequest(new { message = "Username นี้ถูกใช้ไปแล้ว!" });

                // สร้าง User ใหม่
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    Gender = request.Gender,
                    Phone = request.Phone,
                    DateOfBirth = request.DateOfBirth
                };

                user.SetPassword(request.Password);
                

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                if (request.UserTags != null)
                {
                    foreach (var tag in request.UserTags)
                    {
                        tag.UserId = user.Id;
                        _context.UserTags.Add(tag);
                    }
                    await _context.SaveChangesAsync();
                }
                return Ok(new { message = "สมัครสมาชิกสำเร็จ!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์", error = ex.Message });
            }
        }



        // [HttpPost]
        // public async Task<IActionResult> Login(string email, string password)
        // {
        //     var user = _context.Users.FirstOrDefault(u => u.Email == email);

        //     if (user == null || !user.VerifyPassword(password)) // 🔹 เปลี่ยนเป็น Hash จริงถ้ามี
        //     {
        //         ModelState.AddModelError("LoginError", "Invalid email or password");
        //         return View();
        //     }

        //     // ✅ สร้าง `Claims` เพื่อนำไปใช้กับ `Authorize`
        //     var claims = new List<Claim>
        //     {
        //          new Claim(ClaimTypes.Name, user.Username),
        //          new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        //     };

        //     var claimsIdentity = new ClaimsIdentity(claims, "MyCookieAuth");
        //     var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);


        //     Console.WriteLine($"User {user.Username} logged in successfully.");

        //     await HttpContext.SignInAsync("MyCookieAuth", claimsPrincipal);


        //     return RedirectToAction("Index", "Home"); // 🔹 ไปที่หน้าแรก
        // }


        [Route("api/login")]
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "ข้อมูลไม่ถูกต้อง" });
            }

            // 🔹 ค้นหาผู้ใช้จาก Username หรือ Email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Identifier || u.Username == request.Identifier);

            // 🔹 ถ้าไม่พบผู้ใช้ หรือไม่มีข้อมูลรหัสผ่าน
            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid username/email or password" });
            }

            // 🔹 ตรวจสอบรหัสผ่านก่อน Verify (ป้องกัน `null` Error)
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid username/email or password" });
            }

            // ✅ สร้าง Claims สำหรับ Authentication
            var claims = new List<Claim>
    {
         new Claim(ClaimTypes.Name, user.Username),
         new Claim(ClaimTypes.Email, user.Email ?? ""),
         new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
    };

            var claimsIdentity = new ClaimsIdentity(claims, "MyCookieAuth");
            var claimsPrincipal = new ClaimsPrincipal(claimsIdentity);

            Console.WriteLine($"User {user.Username} logged in successfully.");

            await HttpContext.SignInAsync("MyCookieAuth", claimsPrincipal);

            return Ok(new { message = "Login สำเร็จ!", user = user.Username });
        }


        // ✅ Model สำหรับ Login
        public class LoginRequest
        {
            public string Identifier { get; set; } // ใช้ได้ทั้ง Username และ Email
            public string Password { get; set; }
        }

        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("MyCookieAuth"); // ✅ ลบ `Cookie` ออกจากระบบ

            return RedirectToAction("Login");
        }
    }
}