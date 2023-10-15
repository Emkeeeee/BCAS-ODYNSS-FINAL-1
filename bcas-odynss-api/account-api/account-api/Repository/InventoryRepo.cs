using account_api.Models;
using Dapper;
using System.Data.SqlClient;
using System.Security.Principal;

namespace account_api.Repository
{
    public class InventoryRepo
    {
        private readonly string _connectionString;

        public InventoryRepo(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task InsertDynamicData(InventoryDataModel data)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                var fieldNames = string.Join(", ", data.Fields.Keys);
                var paramNames = data.Fields.Select((field, index) => $"@{index}").ToArray();
                var query = $"INSERT INTO {data.TableName} ({fieldNames}) VALUES ({string.Join(", ", paramNames)})";

                await connection.ExecuteAsync(query, data.Fields);
            }
        }
    }
}
