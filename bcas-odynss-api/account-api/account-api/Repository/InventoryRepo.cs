using account_api.Models;
using Dapper;
using Microsoft.SqlServer.Server;
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

        public void InsertFormData(List<InventoryDataModel> inventoryDataModels)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();
                foreach (var field in inventoryDataModels)
                {
                    string insertQuery = "INSERT INTO YourTable (FieldName, FieldValue) VALUES (@Name, @Value)";
                    connection.Execute(insertQuery, field);
                }
            }
        }
    }
}
