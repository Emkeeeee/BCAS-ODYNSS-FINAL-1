using account_api.Models;
using System;
using System.Data.SqlClient;
using System.Net;
using System.Security.Cryptography;
using Dapper;
using System.Data;

namespace account_api.Repository
{
    public class AccountRepo
    {
        private readonly string _connectionString;

        public AccountRepo(string connectionString)
        {
            _connectionString = connectionString;
        }

        public HttpStatusCode InsertAccount(AccountModel account)
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

                return HttpStatusCode.OK; // 200 OK
            }
        }

        public void DeactivateAccount(int userId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Users SET isActive = 0 WHERE user_id = @UserId";
                db.Execute(sql, new { UserId = userId });
            }
        }

        public void ActivateAccount(int userId)
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "UPDATE Users SET isActive = 1 WHERE user_id = @UserId";
                db.Execute(sql, new { UserId = userId });
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
                var sql = "SELECT * FROM Users WHERE isActive=1";
                return connection.Query<Models.SelectAccountModel>(sql);
            }
        }

        public IEnumerable<Models.SelectAccountModel> GetDeactAccounts()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                // Perform the query using Dapper
                var sql = "SELECT * FROM Users WHERE isActive=0";
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
    }
}
