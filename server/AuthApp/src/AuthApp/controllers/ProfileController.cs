using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.S3;
using Amazon.S3.Transfer;
using AuthApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace AuthApp.Controllers
{
	[Authorize]
	[ApiController]
	[Route("api/profile")]
	public class ProfileController : ControllerBase
	{
		private readonly IAmazonS3 _s3Client;
		private readonly DynamoDBContext _context;
		private readonly IConfiguration _config;

		public ProfileController(IAmazonS3 s3Client, IAmazonDynamoDB dynamoDb, IConfiguration config)
		{
			_s3Client = s3Client;
			_context = new DynamoDBContext(dynamoDb);
			_config = config;
		}

		[HttpPost("upload")]
		public async Task<IActionResult> UploadProfileImage([FromForm] IFormFile file)
		{
			var email = User.FindFirst("sub")?.Value;
			if (email == null) return Unauthorized();

			var user = await _context.LoadAsync<User>(email);
			if (user == null) return NotFound("User not found.");

			var bucketName = _config["AWS:auth-app-bucket1"];
			var fileName = $"{email}_{file.FileName}";

			using var stream = new MemoryStream();
			await file.CopyToAsync(stream);
			var uploadRequest = new TransferUtilityUploadRequest
			{
				InputStream = stream,
				Key = fileName,
				BucketName = bucketName,
				ContentType = file.ContentType
			};

			var transferUtility = new TransferUtility(_s3Client);
			await transferUtility.UploadAsync(uploadRequest);

			user.ProfileImageUrl = $"https://{bucketName}.s3.amazonaws.com/{fileName}";
			await _context.SaveAsync(user);

			return Ok(new { ImageUrl = user.ProfileImageUrl });
		}
	}
}
