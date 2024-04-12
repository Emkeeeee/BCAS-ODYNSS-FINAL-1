using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using account_api.Models;

namespace account_api.Repository
{
    public class ReturnBorrowRepo
    {
        private readonly string _connectionString;

        public ReturnBorrowRepo(string connectionString)
        {
            _connectionString = connectionString;
        }

        public IEnumerable<BorrowHistoryItem> GetAllBorrowHistory()
        {
            using (IDbConnection db = new SqlConnection(_connectionString))
            {
                string sql = "SELECT * FROM BorrowHistory;";
                return db.Query<BorrowHistoryItem>(sql);
            }
        }
    }
}
