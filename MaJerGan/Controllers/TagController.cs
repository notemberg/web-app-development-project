using MaJerGan.Data;
using MaJerGan.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
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

        [HttpGet]
        public IActionResult GetTags()
        {
            var tags = _context.Tags.Select(t => t.Name).ToList();
            return Ok(tags);
        }
    }
}
