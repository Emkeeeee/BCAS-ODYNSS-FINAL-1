using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using account_api.Models;
using account_api.Repository;

namespace account_api.Controllers
{
    

    [Route("api/[controller]")]
    [ApiController]

    public class InventoryController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        private readonly InventoryRepo _inventoryRepo;

        public InventoryController(IConfiguration configuration)
        {
            _configuration = configuration;
            string connectionString = configuration.GetConnectionString("InventoryConnection");
            _inventoryRepo = new InventoryRepo(connectionString);
        }

        [HttpPost]
[       Route("NewTable")]
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
                        CREATE TABLE {tableName} (ID INT IDENTITY(1,1) PRIMARY KEY, UID NVARCHAR(100), ItemName NVARCHAR(100), ItemQuantity INT);
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
                    .Where(row =>
                        row["COLUMN_NAME"].ToString() != "ID" &&
                        row["COLUMN_NAME"].ToString() != "UID" &&
                        row["COLUMN_NAME"].ToString() != "ItemName" &&
                        row["COLUMN_NAME"].ToString() != "ItemQuantity") // Exclude specified columns
                    .Select(row => new
                    {
                        Name = row["COLUMN_NAME"].ToString(),
                        // You can include additional column properties if needed
                    })
                    .ToList();

                if (columns.Count == 0)
                {
                    // If there are no other columns available, return a NotFound status
                    return Ok();
                }

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
        [HttpPost]
        [Route("api/dynamicform")]
        public IActionResult InsertFormData(string tableName, string UID, List<InventoryDataModel> formData)
        {
            string connectionString = _configuration.GetConnectionString("InventoryConnection");

            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();

                // Check if the UID already exists in the table
                string checkQuery = $"SELECT COUNT(*) FROM {tableName} WHERE UID = @UID";
                int uidCount = connection.ExecuteScalar<int>(checkQuery, new { UID });

                if (uidCount > 0)
                {
                    // UID exists, update the existing data
                    foreach (var field in formData)
                    {
                        string updateQuery = $"UPDATE {tableName} SET [{field.Name}] = @Value WHERE UID = @UID";
                        connection.Execute(updateQuery, new { Value = field.Value, UID });
                    }
                }
                else
                {
                    // UID does not exist, insert new data into a single row
                    var parameters = new DynamicParameters();
                    parameters.Add("UID", UID);

                    foreach (var field in formData)
                    {
                        parameters.Add(field.Name, field.Value);
                    }

                    string insertQuery = $"INSERT INTO {tableName} ([UID], {string.Join(", ", formData.Select(f => $"[{f.Name}]"))}) VALUES (@UID, {string.Join(", ", formData.Select(f => $"@{f.Name}"))})";
                    connection.Execute(insertQuery, parameters);
                }
            }
            return Ok("Data inserted or updated successfully.");
        }

        [HttpPost]
        [Route("api/column")]
        public IActionResult CreateColumn([FromBody] ColumnRequestModel columnRequest)
        {
            string connectionString = _configuration.GetConnectionString("InventoryConnection");
            using (var connection = new SqlConnection(connectionString))
            {
                try
                {
                    string tableName = columnRequest.TableName;
                    string columnName = columnRequest.ColumnName;
                    string dataType = columnRequest.DataType;

                    // Check if the column already exists
                    bool columnExists = CheckIfColumnExists(connection, tableName, columnName);

                    if (columnExists)
                    {
                        return BadRequest($"Column '{columnName}' already exists in table '{tableName}'.");
                    }

                    string sql = $"ALTER TABLE {tableName} ADD {columnName} {dataType}";

                    connection.Execute(sql);

                    return Ok("Column created successfully");
                }
                catch (Exception ex)
                {
                    return BadRequest($"Error: {ex.Message}");
                }
            }
        }

        private bool CheckIfColumnExists(SqlConnection connection, string tableName, string columnName)
        {
            // Query the information_schema to check if the column exists in the table
            string sql = $@"
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_name = @TableName
        AND column_name = @ColumnName";

            int count = connection.ExecuteScalar<int>(sql, new { TableName = tableName, ColumnName = columnName });

            return count > 0;
        }
    }
}
