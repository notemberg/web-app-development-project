using MaJerGan.Data;
using MaJerGan.Models;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace MaJerGan.Controllers
{
    [Route("api/tags")]
    [ApiController]
    public class TagController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TagController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ✅ ดึงแท็กทั้งหมดจากฐานข้อมูล
        [HttpGet]
        public IActionResult GetTags()
        {
            try
            {
                if (_context.Database.CanConnect())
                {
                    var tags = _context.Tags
                        .Select(t => new { t.Id, t.Name }) // ✅ ส่งทั้ง Id และ Name
                        .ToList();
                    return Ok(tags);
                }
                else
                {
                    return StatusCode(500, "Database connection failed");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        // ✅ เพิ่มแท็กใหม่เข้า Database
        [HttpPost]
        public IActionResult AddTag([FromBody] Tag newTag)
        {
            if (string.IsNullOrWhiteSpace(newTag.Name))
            {
                return BadRequest("Tag name cannot be empty");
            }

            // ตรวจสอบว่ามีแท็กนี้อยู่แล้วหรือไม่
            if (_context.Tags.Any(t => t.Name == newTag.Name))
            {
                return Conflict("This tag already exists");
            }

            newTag.Name = newTag.Name.Trim(); // ✅ ตัดช่องว่างออกเพื่อความปลอดภัย
            _context.Tags.Add(newTag);
            _context.SaveChanges();

            return Ok(new { name = newTag.Name }); // ✅ คืนค่าเป็น JSON ที่แน่ใจว่าเป็น string
        }

    }
}
