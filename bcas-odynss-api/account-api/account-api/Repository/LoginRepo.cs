using Dapper;
using System;
using System.Data.SqlClient;
using System.Security.Cryptography;
using account_api.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace account_api.Repository
{
    public class LoginRepo
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public LoginRepo(string connectionString, IConfiguration configuration)
        {
            _connectionString = connectionString;
            _configuration = configuration;
        }

        public (LoginModel User, string Token) CheckCredentials(string username, string password)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                var query = "SELECT * FROM Users WHERE username = @Username AND isActive = 1";
                var parameters = new { Username = username };
                var user = connection.QueryFirstOrDefault<LoginModel>(query, parameters);

                if (user != null)
                {
                    byte[] salt = Convert.FromBase64String(user.salt);

                    string hashPass = HashPassword(password, salt);

                    bool isPasswordCorrect = SlowEquals(Convert.FromBase64String(user.password), Convert.FromBase64String(hashPass));

                    if (isPasswordCorrect)
                    {
                        user.password = null;
                        user.salt = null;

                        // Generate JWT token for the authenticated user
                        var token = GenerateJwtToken(user.user_id.ToString(), user.username);

                        return (user, token);
                    }
                }

                return (null, null);
            }
        }

        public string GenerateJwtToken(string userId, string username)
        {
            var secretKey = _configuration["Jwt:SecretKey"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            if (string.IsNullOrEmpty(secretKey) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
            {
                throw new InvalidOperationException("JWT configuration values are missing or invalid.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim(ClaimTypes.NameIdentifier, userId),
        new Claim(ClaimTypes.Name, username),
        // Add additional claims as needed
    };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(5), // Token expires in 5 minutes, adjust as needed
                signingCredentials: creds
            );

            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password, byte[] salt)
        {
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(32); // Adjust the size based on your security requirements
                return Convert.ToBase64String(hash);
            }
        }

        private bool SlowEquals(byte[] a, byte[] b)
        {
            uint diff = (uint)a.Length ^ (uint)b.Length;
            for (int i = 0; i < a.Length && i < b.Length; i++)
            {
                diff |= (uint)(a[i] ^ b[i]);
            }
            return diff == 0;
        }
    }
}
