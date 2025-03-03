using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using MaJerGan.Data;
using MaJerGan.Models;
using MaJerGan.Services;

namespace MaJerGan.Controllers
{
    public class ProfileController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public ProfileController(ApplicationDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // ✅ ฟังก์ชันช่วยดึงข้อมูลผู้ใช้จาก Claims
        private User GetUserFromClaims()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return null;

            int userId = int.Parse(userIdClaim.Value);
            return _context.Users.FirstOrDefault(u => u.Id == userId);
        }

        [HttpGet]
        public IActionResult Index()
        {
            var user = GetUserFromClaims();
            if (user == null)
            {
                return RedirectToAction("Login", "Auth"); // ถ้าไม่ได้ล็อกอินให้ไปหน้า Login
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

            var user = GetUserFromClaims();
            if (user == null)
            {
                return Json(new { success = false, message = "Unauthorized" });
            }

            // ✅ ตรวจสอบว่า Email หรือ Username ซ้ำหรือไม่
            if (_context.Users.Any(u => u.Email == model.Email && u.Id != user.Id))
            {
                return Json(new { success = false, message = "This email is already in use." });
            }

            if (_context.Users.Any(u => u.Username == model.Username && u.Id != user.Id))
            {
                return Json(new { success = false, message = "This username is already taken." });
            }

            // ✅ อัปเดตข้อมูล (แต่ไม่ให้แก้ไข DateOfBirth และ Gender)
            user.Username = model.Username;
            user.Email = model.Email;
            user.Phone = model.Phone;
            user.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Json(new { success = true, message = "Profile updated successfully!" });
        }

        [HttpPost]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Invalid input data" });
            }

            var user = GetUserFromClaims();
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
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Password changed successfully!" });
        }

        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "No file uploaded" });
                }

                // ✅ ตรวจสอบประเภทไฟล์ (รับเฉพาะ .jpg, .jpeg, .png)
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { success = false, message = "Invalid file type. Only JPG, JPEG, PNG allowed." });
                }

                // ✅ จำกัดขนาดไฟล์ (ไม่เกิน 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { success = false, message = "File size exceeds 5MB limit." });
                }

                var user = GetUserFromClaims();
                if (user == null)
                {
                    return Unauthorized(new { success = false, message = "Unauthorized" });
                }

                // ✅ ดึง Public ID จาก URL ของ Cloudinary (รูปเก่า)
                if (!string.IsNullOrEmpty(user.ProfilePicturee))
                {
                    var oldPublicId = user.ProfilePicturee.Split('/').Last().Split('.').First();
                    await _cloudinaryService.DeleteImageAsync("profile-pictures/" + oldPublicId);
                }

                using (var stream = file.OpenReadStream())
                {
                    Console.WriteLine($"Uploading file: {file.FileName}");

                    // ✅ ตรวจสอบว่า CloudinaryService โหลดค่าถูกต้องหรือไม่
                    if (_cloudinaryService == null)
                    {
                        throw new Exception("CloudinaryService is not initialized.");
                    }

                    Console.WriteLine("Uploading image to Cloudinary...");

                    // ✅ อัปโหลดรูปไปยัง Cloudinary
                    var imageUrl = await _cloudinaryService.UploadImageAsync(stream, file.FileName);

                    if (string.IsNullOrEmpty(imageUrl))
                    {
                        return StatusCode(500, new { success = false, message = "Image upload failed!(controller)" });
                    }

                    Console.WriteLine($"Image uploaded successfully: {imageUrl}");

                    // ✅ บันทึก URL รูปลงใน Database
                    user.ProfilePicturee = imageUrl;  // **เปลี่ยนจาก `ProfilePicturee` เป็น `ProfilePicture`**
                    await _context.SaveChangesAsync();

                    return Ok(new { success = true, message = "Profile picture updated successfully!", imageUrl });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Internal server error", error = ex.Message });
            }
        }
    }
}
