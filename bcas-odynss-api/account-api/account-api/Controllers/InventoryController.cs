using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using account_api.Models;
using System.Data.Common;

namespace account_api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public InventoryController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost]
[Route("NewTable")]
public IActionResult CreateTable([FromQuery] string tableName)
{
    string connectionString = _configuration.GetConnectionString("InventoryConnection");

    using (IDbConnection connection = new SqlConnection(connectionString))
    {
        connection.Open();

        // Check if the table already exists
        string checkTableQuery = $@"
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = @TableName)
            BEGIN
                SELECT 'Existing table' AS Result;
            END
            ELSE
            BEGIN
                -- Create the table if it does not exist
                CREATE TABLE {tableName} (ID INT PRIMARY KEY, UID NVARCHAR(100), ItemName NVARCHAR(100), ItemQuantity INT);
            END";

        string result = connection.QueryFirstOrDefault<string>(checkTableQuery, new { TableName = tableName });
        var response = new InventoryModel { Message = "Table already exists" };
                var responseErr = new InventoryModel { Message = "Table created successfully" };
        if (result == "Existing table")
        {
            return Ok(response);
        }
        else
        {
            return Ok(responseErr);
        }
    }
}

       
        [HttpGet]
        [Route("GetColumn")]
        public IActionResult GetColumns(string tableName)
        {
            string connectionString = _configuration.GetConnectionString("InventoryConnection");

            using (IDbConnection connection = new SqlConnection(connectionString))
            {
                string query = $"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{tableName}'";
                IEnumerable<string> columns = connection.Query<string>(query);
                return Ok(columns);
            }
        }

        [HttpGet]
        [Route("api/table-list")]
        public IActionResult GetTableList()
        {
            string connectionString = _configuration.GetConnectionString("InventoryConnection");
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                var tables = connection.GetSchema("Tables")
                    .AsEnumerable()
                    .Select(row => row["TABLE_NAME"].ToString())
                    .ToList();

                return Ok(tables);
            }
        }

        [HttpGet]
        [Route("api/table-schema")]
        public IActionResult GetTableSchema(string tableName)
        {
            string connectionString = _configuration.GetConnectionString("InventoryConnection");
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                var schema = connection.GetSchema("Columns", new[] { null, null, tableName });

                var columns = schema.AsEnumerable()
                    .Select(row => new
                    {
                        Name = row["COLUMN_NAME"].ToString(),
                        DataType = row["DATA_TYPE"].ToString()
                        // You can include additional column properties if needed
                    })
                    .ToList();

                return Ok(columns);
            }
        }

        [HttpGet("{selectedTable}/{selectedColumns}")]
        public async Task<IActionResult> GetData(string selectedTable, string selectedColumns)
        {
            try
            {

                string connectionString = _configuration.GetConnectionString("InventoryConnection");

                using (IDbConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    // Construct a parameterized SQL query to select specific columns from the selected table
                    var query = $"SELECT {selectedColumns} FROM {selectedTable}";

                    var data = await connection.QueryAsync(query);

                    return Ok(data);
                }

                
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
