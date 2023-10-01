using account_api.Models;
using Dapper;
using System.Data.SqlClient;
using System.Security.Principal;

namespace account_api.Repository
{
    public class AccountRepo
    {
        private readonly string _connectionString;

        public AccountRepo(string connectionString)
        {
            _connectionString = connectionString;
        }

        public void InsertAccount(AccountModel account)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                string query = "INSERT INTO AccountTbl (username, password, user_type, department)" + 
                    "VALUES (@username, @password, @user_type, @department)";
                connection.Execute(query, account);
            }
        }

        public IEnumerable<Models.AccountModel> GetAccounts()
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                // Perform the query using Dapper
                var sql = "SELECT * FROM AccountTbl";
                return connection.Query<Models.AccountModel>(sql);
            }
        }

        public Models.LoginModel CheckCredentials(string username, string password)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                var query = "SELECT * FROM Users WHERE Username = @Username AND Password = @Password";
                var parameters = new { Username = username, Password = password };
                var user = connection.QueryFirstOrDefault<Models.LoginModel>(query, parameters);

                return user;
            }
        }

    }
}
