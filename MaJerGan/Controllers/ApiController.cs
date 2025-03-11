using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MaJerGan.Data;
using MaJerGan.Models;
using System.Security.Claims;

namespace MaJerGan.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApiController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ApiController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("get-api-key")]
        public IActionResult GetApiKey()
        {
            var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");
            return Ok(new { apiKey });
        }
    }

}
