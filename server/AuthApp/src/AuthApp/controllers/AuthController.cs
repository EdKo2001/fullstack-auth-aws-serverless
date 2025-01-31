using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using AuthApp.Models;
using AuthApp.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace AuthApp.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly DynamoDBContext _context;
        private readonly JwtService _jwtService;

        public AuthController(IAmazonDynamoDB dynamoDb, JwtService jwtService)
        {
            _context = new DynamoDBContext(dynamoDb);
            _jwtService = jwtService;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] User model)
        {
            var existingUser = await _context.LoadAsync<User>(model.Email);
            if (existingUser != null) return BadRequest("Email already exists.");

            model.PasswordHash = HashPassword(model.PasswordHash);
            await _context.SaveAsync(model);

            return Ok("User registered.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User model)
        {
            var user = await _context.LoadAsync<User>(model.Email);
            if (user == null || !VerifyPassword(model.PasswordHash, user.PasswordHash))
                return Unauthorized("Invalid credentials.");

            var token = _jwtService.GenerateToken(user.Email);
            return Ok(new { Token = token, User = user });
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            return Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));
        }

        private bool VerifyPassword(string inputPassword, string storedHash)
        {
            return HashPassword(inputPassword) == storedHash;
        }
    }
}
