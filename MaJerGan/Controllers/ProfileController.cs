using Microsoft.AspNetCore.Mvc;
using MaJerGan.Data;
using MaJerGan.Models;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MaJerGan.Controllers
{
    public class ProfileController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return RedirectToAction("Login", "Auth"); // ถ้าไม่ได้ล็อกอินให้ไปหน้า Login
            }

            int userId = int.Parse(userIdClaim.Value);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return View(user); // ✅ ส่งข้อมูล User ไปที่ Profile.cshtml
        }

        [HttpPost]
        public async Task<IActionResult> Update([FromBody] User model)
        {

            ModelState.Remove("Gender");
            ModelState.Remove("Password");
            ModelState.Remove("PasswordHash");
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return Json(new { success = false, message = "Invalid data", errors });
            }

            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Json(new { success = false, message = "Unauthorized" });
            }

            int userId = int.Parse(userIdClaim.Value);
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
            {
                return Json(new { success = false, message = "User not found" });
            }

            // ✅ ตรวจสอบว่า Email หรือ Username ซ้ำหรือไม่
            var existingEmail = _context.Users.Any(u => u.Email == model.Email && u.Id != userId);
            var existingUsername = _context.Users.Any(u => u.Username == model.Username && u.Id != userId);

            if (existingEmail)
            {
                return Json(new { success = false, message = "This email is already in use." });
            }

            if (existingUsername)
            {
                return Json(new { success = false, message = "This username is already taken." });
            }

            // ✅ อัปเดตข้อมูล (แต่ไม่ให้แก้ไข DateOfBirth และ Gender)
            user.Username = model.Username;
            user.Email = model.Email;
            user.Phone = model.Phone;
            user.UpdatedAt = System.DateTime.Now;

            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Profile updated successfully!" });
        }


        [HttpPost]
        public IActionResult ChangePassword([FromBody] ChangePasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                Console.WriteLine("❌ ModelState ไม่ผ่าน: " + string.Join(", ", ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)));
                return BadRequest(new { success = false, message = "Invalid input dataHII" });
            }

            var user = _context.Users.Find(model.UserId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            if (!user.VerifyPassword(model.OldPassword))
            {
                return BadRequest(new { success = false, message = "Old password is incorrect" });
            }

            user.SetPassword(model.NewPassword);
            user.UpdatedAt = DateTime.Now;
            _context.SaveChanges();

            return Ok(new { success = true, message = "Password changed successfully!" });
        }
    }
}
