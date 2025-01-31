namespace AuthApp.Models
{
	public class User
	{
		public string Email { get; set; }
		public string Name { get; set; }
		public string PasswordHash { get; set; }
		public string ProfileImageUrl { get; set; }
	}
}
