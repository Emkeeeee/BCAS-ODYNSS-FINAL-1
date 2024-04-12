using account_api.Models;
using System;
using System.Data.SqlClient;
using System.Net;
using System.Security.Cryptography;
using Dapper;
using System.Data;
using System.Security.Principal;
using MimeKit;
using MailKit.Net.Smtp;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace account_api.Repository
{
    public class AccountRepo
    {
        private readonly string _connectionString;
        private readonly IConfiguration _configuration;

        public AccountRepo(string connectionString, IConfiguration configuration)
        {
            _connectionString = connectionString;
            _configuration = configuration;
        }

        public HttpStatusCode InsertAccount(AccountModel account, int creatorId)
        {
            // Check for null or whitespace in username and password
            if (string.IsNullOrWhiteSpace(account.username) || string.IsNullOrWhiteSpace(account.password))
            {
                return HttpStatusCode.BadRequest; // 400 Bad Request
            }

            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                // Check if the username already exists
                if (IsUsernameExists(connection, account.username))
                {
                    return HttpStatusCode.Conflict; // 409 Conflict
                }

                // Check if the email is already in use
                if (IsEmailUsed(connection, account.email))
                {
                    return HttpStatusCode.Conflict; // 409 Conflict
                }

                // Generate a random salt
                byte[] salt = GenerateSalt();

                // Hash the password using PBKDF2 with the generated salt
                string hashedPassword = HashPassword(account.password, salt);

                string query = "INSERT INTO Users (username, password, firstName, lastName, salt, department, email, createdAt, isAdmin, isActive)" +
                                "VALUES (@username, @password, @firstName, @lastName, @salt, @department, @email, @createdAt, @isAdmin, @isActive)";

                // Pass the hashed password and salt to the query
                connection.Execute(query, new
                {
                    username = account.username,
                    password = hashedPassword,
                    firstName = account.firstName,
                    lastName = account.lastName,
                    salt = Convert.ToBase64String(salt), // Convert the salt to a string for storage
                    department = account.department,
                    email = account.email,
                    createdAt = DateTime.Now,
                    isAdmin = account.isAdmin,
                    isActive = 1
                });

                string logQuery = "INSERT INTO AccountLog (acc_username, creator_id, action, time) VALUES (@username, @creatorId, 'Account creation', @time)";
                connection.Execute(logQuery, new
                {
                    username = account.username,
                    creatorId = creatorId,
                    time = DateTime.Now
                });

                return HttpStatusCode.OK; // 200 OK
            }
        }

        public void DeactivateAccount(int userId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Users SET isActive = 0 WHERE user_id = @UserId";
                db.Execute(sql, new { UserId = userId });

                // Logging account deactivation
                string logQuery = "INSERT INTO AccountLog (acc_username, creator_id, action, time) VALUES ((SELECT username FROM Users WHERE user_id = @UserId), @creatorId, 'Account deactivation', @time)";
                db.Execute(logQuery, new
                {
                    UserId = userId,
                    creatorId = creatorId,
                    time = DateTime.Now
                });
            }
        }

        public void ActivateAccount(int userId, int creatorId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Users SET isActive = 1 WHERE user_id = @UserId";
                db.Execute(sql, new { UserId = userId });

                // Logging account activation
                string logQuery = "INSERT INTO AccountLog (acc_username, creator_id, action, time) VALUES ((SELECT username FROM Users WHERE user_id = @UserId), @creatorId, 'Account restore', @time)";
                db.Execute(logQuery, new
                {
                    UserId = userId,
                    creatorId = creatorId,
                    time = DateTime.Now
                });
            }
        }


        private byte[] GenerateSalt()
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                byte[] salt = new byte[16]; // Adjust the size based on your security requirements
                rng.GetBytes(salt);
                return salt;
            }
        }

        private string HashPassword(string password, byte[] salt)
        {
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256))
            {
                byte[] hash = pbkdf2.GetBytes(32); // Adjust the size based on your security requirements
                return Convert.ToBase64String(hash);
            }
        }

        private bool IsUsernameExists(SqlConnection connection, string username)
        {
            string query = "SELECT COUNT(*) FROM Users WHERE username = @username";
            int count = connection.QuerySingleOrDefault<int>(query, new { username });
            return count > 0;
        }

        private bool IsEmailUsed (SqlConnection connection, string email)
        {
            string query = "SELECT COUNT(*) FROM Users WHERE email = @email";
            int count = connection.QuerySingleOrDefault<int>(query, new { email });
            return count > 0;
        }

        public IEnumerable<Models.SelectAccountModel> GetAccounts()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                // Perform the query using Dapper
                var sql = "SELECT u.user_id, u.username, u.firstname, u.lastname, d.department, u.email, FORMAT(createdAt, 'dd-MM-yyyy hh:mm:ss tt') AS formatted_createdAt, u.isAdmin  FROM Users u LEFT JOIN Department d ON u.department = d.dept_id WHERE u.isActive=1";
                return connection.Query<Models.SelectAccountModel>(sql);
            }
        }

        public IEnumerable<Models.SelectAccountModel> GetDeactAccounts()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                // Perform the query using Dapper
                var sql = "SELECT u.user_id, u.username, u.firstname, u.lastname, d.department, u.email, FORMAT(createdAt, 'dd-MM-yyyy hh:mm:ss tt') AS formatted_createdAt, u.isAdmin  FROM Users u LEFT JOIN Department d ON u.department = d.dept_id WHERE u.isActive=0";
                return connection.Query<Models.SelectAccountModel>(sql);
            }
        }

        public int GetActiveAccountsCount()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                var sql = "SELECT COUNT(*) FROM Users WHERE isActive = 1";
                return connection.ExecuteScalar<int>(sql);
            }
        }

        public int GetDeactiveAccountsCount()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                var sql = "SELECT COUNT(*) FROM Users WHERE isActive = 0";
                return connection.ExecuteScalar<int>(sql);
            }
        }

        public IEnumerable<Models.SelectAccountModel> GetAccountViaId(int userId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                // Perform the query using Dapper
                var sql = "SELECT * FROM Users WHERE isActive=1 AND user_id = @UserId";
                return connection.Query<Models.SelectAccountModel>(sql, new { UserId = userId });
            }
        }

        public HttpStatusCode EditAccount(int userId, string firstName, string lastName, string email, int creatorId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                try
                {
                    connection.Open();

                    // Check if the email is already used
                    if (IsEmailUsed(connection, email))
                    {
                        return HttpStatusCode.Conflict; // 409 Conflict
                    }

                    // Use parameterized query to prevent SQL injection
                    string sql = "UPDATE Users SET firstname = @FirstName, lastname = @LastName, email = @Email WHERE user_id = @UserId";
                    connection.Execute(sql, new { UserId = userId, FirstName = firstName, LastName = lastName, Email = email });

                    // Logging account edit
                    string logQuery = "INSERT INTO AccountLog (acc_username, creator_id, action, time) VALUES ((SELECT username FROM Users WHERE user_id = @UserId), @creatorId, 'Account edit', @time)";
                    connection.Execute(logQuery, new
                    {
                        UserId = userId,
                        creatorId = creatorId,
                        time = DateTime.Now
                    });

                    // Decide what HttpStatusCode to return upon successful update
                    return HttpStatusCode.OK; // 200 OK or HttpStatusCode.NoContent; // 204 No Content
                }
                catch (Exception ex)
                {
                    // Handle exceptions appropriately, log, and maybe return a different HttpStatusCode
                    Console.WriteLine($"An error occurred: {ex.Message}");
                    return HttpStatusCode.InternalServerError; // 500 Internal Server Error
                }
            }
        }


        public HttpStatusCode ChangePasswordViaLink(string username, string password)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                try
                {
                    connection.Open();

                    var query = "SELECT * FROM Users WHERE username = @Username AND isActive = 1";
                    var parameters = new { Username = username };
                    var user = connection.QueryFirstOrDefault<LoginModel>(query, parameters);

                    if (user != null)
                    {
                        byte[] salt = Convert.FromBase64String(user.salt);

                        string hashPass = HashPassword(password, salt);

                        var changepassquery = "UPDATE Users SET password = @Password where username = @Username";

                        connection.Execute(changepassquery, new { Username = username, Password = hashPass });

                        return HttpStatusCode.OK;
                    }
                    else
                    {
                        return HttpStatusCode.NotFound; // User not found
                    }
                }
                catch (Exception ex)
                {
                    // Log the exception
                    // Example: _logger.LogError(ex, "Error occurred while changing password via link");
                    return HttpStatusCode.InternalServerError; // 500 Internal Server Error
                }
            }
        }


        public void SendChangePasswordEmail(string recipientEmail)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                try
                {
                    if (!IsEmailExist(connection, recipientEmail))
                    {
                        throw new Exception("Invalid user or inactive account.");
                    }

                    var token = GenerateJwtToken(recipientEmail);

                    var message = new MimeMessage();
                    message.From.Add(new MailboxAddress("BCAS ODYNSS", "russelarchiefoodorder@gmail.com"));
                    message.To.Add(new MailboxAddress("", recipientEmail));
                    message.Subject = "Change Password";

                    var bodyBuilder = new BodyBuilder();
                    bodyBuilder.TextBody = $"Click the following link to change your password: http://localhost:3000/changepassword/{token}";

                    message.Body = bodyBuilder.ToMessageBody();

                    using (var client = new SmtpClient())
                    {
                        client.Connect("smtp.gmail.com", 587, false);
                        client.Authenticate("russelarchiefoodorder@gmail.com", "cjwitldatrerscln");
                        client.Send(message);
                        client.Disconnect(true);
                    }
                }
                catch (Exception ex)
                {
                    // Log or handle the exception
                    throw; // Rethrow the exception to propagate it upwards
                }
            }
        }

        private bool IsEmailExist(SqlConnection connection, string email)
        {
            string query = "SELECT COUNT(*) FROM Users WHERE email = @email AND isActive = 1";
            int count = connection.QuerySingleOrDefault<int>(query, new { email });
            return count > 0;
        }
        

        public string GenerateJwtToken(string email)
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
                new Claim(ClaimTypes.Email, email),
                // Add additional claims as needed
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15), // Token expires in 15 minutes, adjust as needed
                signingCredentials: creds
            );

            return tokenHandler.WriteToken(token);
        }

        public static bool IsTokenExpired(string token, IConfiguration configuration)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:SecretKey"])),
                    ValidateIssuer = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = configuration["Jwt:Audience"]
                };

                SecurityToken securityToken;
                var claimsPrincipal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);

                var expClaim = claimsPrincipal.FindFirst("exp");
                if (expClaim != null)
                {
                    var expirationTimeUnix = long.Parse(expClaim.Value);
                    var expirationTime = DateTimeOffset.FromUnixTimeSeconds(expirationTimeUnix).UtcDateTime;

                    return expirationTime <= DateTime.UtcNow;
                }

                return true;
            }
            catch (Exception)
            {
                return true;
            }
        }

        public List<AccountLogModel> GetAccountLogs()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                string sql = @"SELECT 
                                al.acclog_id, 
                                al.acc_username, 
                                u.firstname + ' ' + u.lastname AS admin,
                                al.action, 
                                FORMAT(al.[time], 'dd-MM-yyyy hh:mm:ss tt') AS formatted_time
                            FROM 
                                AccountLog al
                            LEFT JOIN
                                Users u ON al.creator_id = u.user_id";

                return connection.Query<AccountLogModel>(sql).ToList();
            }
        }
    }
}
