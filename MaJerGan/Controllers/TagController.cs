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
            var tags = _context.Tags.Select(t => t.Name).ToList();
            return Ok(tags);
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

            _context.Tags.Add(newTag);
            _context.SaveChanges();
            return Ok(newTag.Name);
        }
    }
}
