using Dapper;
using System.Data.SqlClient;

namespace account_api.Repository
{
    public class LoginRepo
    {
        private readonly string _connectionString;

        public LoginRepo(string connectionString)
        {
            _connectionString = connectionString;
        }

        public Models.LoginModel CheckCredentials(string username, string password)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                var query = "SELECT * FROM AccountTbl WHERE username = @Username AND password = @Password";
                var parameters = new { Username = username, Password = password};
                var user = connection.QueryFirstOrDefault<Models.LoginModel>(query, parameters);

                return user;
            }
        }
    }
}
